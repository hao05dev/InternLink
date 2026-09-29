package com.internlink.core.application.portfolio;

import com.internlink.core.application.placement.InternshipReportService;
import com.internlink.core.application.system.DocumentService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.placement.*;
import com.internlink.core.infrastructure.persistence.jpa.*;
import com.internlink.core.shared.enums.*;
import com.internlink.core.shared.exception.*;
import com.internlink.core.shared.security.*;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.*;
import java.math.BigDecimal;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;
import static com.internlink.core.application.portfolio.PortfolioContent.*;

@Service @RequiredArgsConstructor
public class PortfolioService {
    private final JpaInternshipPlacementRepository placements;
    private final JpaUserRepository users;
    private final JpaStudentRosterRepository rosters;
    private final JpaPortfolioFormRepository forms;
    private final JpaPortfolioRevisionRepository revisions;
    private final JpaPortfolioSignedFileRepository signedFiles;
    private final JpaInternshipReportRepository reports;
    private final SecurityGuard security;
    private final DailyJournalService daily;
    private final PortfolioDocxExporter exporter;
    private final DocumentService documents;
    private final InternshipReportService reportService;
    private final PortfolioScoring scoring;

    public static final List<String> KINDS=List.of("M01","M02","M03","M04","M05");
    public record Save(Integer version,@NotNull Map<String,Object> content) {}
    public record Action(@NotBlank String action,@NotNull Integer version,@Size(max=4000) String note) {}
    public record FormView(UUID id,String kind,String status,Integer version,String templateVersion,boolean published,
        boolean canRead,boolean canEdit,boolean canReview,boolean canPublish,Map<String,Object> content,String feedback,
        OffsetDateTime updatedAt,List<RevisionView> revisions,List<FileView> signedFiles) {}
    public record RevisionView(UUID id,String action,String actor,String note,OffsetDateTime createdAt,boolean downloadable) {}
    public record FileView(UUID id,String name,UUID revisionId,OffsetDateTime uploadedAt) {}
    public record Download(String name,String mime,byte[] bytes) {}

    @Transactional(readOnly=true)
    public List<Map<String,Object>> myPlacements() {
        User a=actor();
        List<InternshipPlacement> list=switch(a.getRole()) {
            case STUDENT->placements.findByStudentId(a.getId());
            case COMPANY_MENTOR->placements.findByMentorId(a.getId());
            case LECTURER->placements.findByLecturerId(a.getId());
            case FACULTY_ADMIN->a.getDepartment()==null?List.of():placements.findByTermDepartmentId(a.getDepartment().getId());
            default->List.of();
        };
        return list.stream().filter(p->PortfolioAccess.read(a,p)).sorted(Comparator.comparing(InternshipPlacement::getStartDate).reversed()).map(this::metadata).toList();
    }
    @Transactional(readOnly=true)
    public Map<String,Object> overview(UUID placementId) {
        InternshipPlacement p=placement(placementId,false);User a=actor();ResourceAuthorization.require(PortfolioAccess.read(a,p));
        Map<String,Object> result=new LinkedHashMap<>();result.put("placement",metadata(p));
        result.put("canWriteJournal",PortfolioAccess.student(a,p));result.put("canConfirmJournal",PortfolioAccess.confirmDaily(a,p));
        result.put("forms",KINDS.stream().map(k->view(load(p,k),a)).toList());result.put("weeks",daily.aggregate(p));return result;
    }
    @Transactional
    public FormView save(UUID placementId,String kind,Save input) {
        InternshipPlacement p=placement(placementId,true);User a=actor();PortfolioForm f=load(p,kind);
        ResourceAuthorization.require(PortfolioAccess.edit(a,f));DailyJournalService.active(p);
        DailyJournalService.checkVersion(f.getId()==null?null:f.getVersion(),input.version());
        if(!Set.of("DRAFT","REVISION_REQUIRED").contains(status(f)) || f.isPublished()) throw new BadRequestException("Biểu mẫu đã khóa; cần mở lại để chỉnh sửa");
        Map<String,Object> content=clean(kind,input.content(),weekCount(p));
        if("M02".equals(kind)) content=followingContent(p,content);
        f.setContent(content);f.setStatus(status(f));f.setUpdatedBy(a);
        return view(forms.saveAndFlush(f),a);
    }
    @Transactional
    public FormView action(UUID placementId,String kind,Action input) {
        InternshipPlacement p=placement(placementId,true);PortfolioForm f=load(p,kind);User a=actor();
        ResourceAuthorization.require(PortfolioAccess.read(a,p));
        if(f.getId()==null)throw new BadRequestException("Hãy lưu biểu mẫu trước");
        DailyJournalService.checkVersion(f.getVersion(),input.version());
        String action=input.action();String current=status(f);
        if(Set.of("PUBLISH","UNPUBLISH").contains(action)) {
            ResourceAuthorization.require(PortfolioAccess.faculty(a,p));
            if(!PortfolioAccess.confidential(kind)||!Set.of("COMPLETED","APPROVED").contains(current))throw new BadRequestException("Chỉ công bố phiếu đánh giá đã hoàn thành");
            f.setPublished("PUBLISH".equals(action));f.setPublishedBy(a);f.setPublishedAt(OffsetDateTime.now());
            snapshot(f,a,action,input.note(),null);
        } else if(Set.of("APPROVE","REVISION_REQUIRED").contains(action)) {
            ResourceAuthorization.require("M05".equals(kind)&&PortfolioAccess.lecturer(a,p));
            if(!"SUBMITTED".equals(current)||f.getReport()==null) throw new BadRequestException("Báo cáo chưa được gửi");
            String decision="APPROVE".equals(action)?"APPROVED":"REVISION_REQUIRED";
            reportService.review(f.getReport().getId(),decision,input.note());f.setStatus(decision);f.setFeedback(input.note());
            snapshot(f,a,action,input.note(),null);
        } else if("REOPEN".equals(action)) {
            ResourceAuthorization.require(PortfolioAccess.edit(a,f));DailyJournalService.active(p);
            if("M05".equals(kind)||!"COMPLETED".equals(current)||f.isPublished())throw new BadRequestException("Chỉ mở lại phiếu chưa công bố; báo cáo cần giảng viên yêu cầu sửa");
            if(input.note()==null||input.note().isBlank())throw new BadRequestException("Cần ghi lý do mở lại");
            f.setStatus("DRAFT");snapshot(f,a,action,input.note(),null);
        } else {
            ResourceAuthorization.require(PortfolioAccess.edit(a,f));DailyJournalService.active(p);
            if(!Set.of("DRAFT","REVISION_REQUIRED").contains(current))throw new BadRequestException("Biểu mẫu đã được gửi/hoàn thành");
            if(!(("M05".equals(kind)&&"SUBMIT".equals(action))||(!"M05".equals(kind)&&"COMPLETE".equals(action))))throw new BadRequestException("Thao tác không hợp lệ");
            if("M02".equals(kind))f.setContent(followingContent(p,f.getContent()));
            validateComplete(kind,f.getContent(),weekCount(p));
            f.setContent(scoring.prepare(f));
            byte[] bytes=exporter.export(kind,f.getContent(),metadata(p),false);
            if("M05".equals(kind)) {
                var doc=documents.uploadDocument(a.getId(),ContextType.PLACEMENT,p.getId(),DocumentType.REPORT,
                    new BytesFile(fileName(p,kind),PortfolioDocxExporter.MIME,bytes));
                var submitted=reportService.submit(p.getId(),"FINAL",doc.getId());
                f.setReport(reports.findById(submitted.id()).orElseThrow());f.setStatus("SUBMITTED");f.setFeedback(null);
            } else f.setStatus("COMPLETED");
            var revision=snapshot(f,a,action,input.note(),bytes);
            scoring.record(f,revision,a);
        }
        f.setUpdatedBy(a);return view(forms.saveAndFlush(f),a);
    }
    @Transactional(readOnly=true)
    public Download export(UUID placementId,String kind,UUID revisionId) {
        InternshipPlacement p=placement(placementId,false);PortfolioForm f=load(p,kind);User a=actor();
        ResourceAuthorization.require(PortfolioAccess.content(a,f));
        byte[] bytes;
        if(revisionId!=null) {
            var r=revisions.findById(revisionId).orElseThrow(()->new ResourceNotFoundException("PortfolioRevision","id",revisionId));
            ResourceAuthorization.require(f.getId()!=null&&f.getId().equals(r.getForm().getId()));
            if(publishedReader(a,f))ResourceAuthorization.require(currentRevision(f).map(v->v.getId().equals(r.getId())).orElse(false));
            if(r.getDocx()==null)throw new BadRequestException("Mốc lịch sử này không có bản DOCX");bytes=r.getDocx();
        } else if(f.getId()!=null&&Set.of("SUBMITTED","COMPLETED","APPROVED").contains(status(f))) {
            bytes=revisions.findFirstByFormIdAndDocxIsNotNullOrderByCreatedAtDesc(f.getId()).map(PortfolioRevision::getDocx)
                .orElseThrow(()->new BadRequestException("Chưa có bản xuất đã chốt"));
        } else bytes=exporter.export(kind,f.getContent(),metadata(p),true);
        return new Download(fileName(p,kind),PortfolioDocxExporter.MIME,bytes);
    }
    @Transactional
    public FileView uploadSigned(UUID placementId,String kind,UUID revisionId,MultipartFile file) throws IOException {
        InternshipPlacement p=placement(placementId,true);PortfolioForm f=load(p,kind);User a=actor();
        boolean offline=p.getMentor()==null&&PortfolioAccess.lecturer(a,p)&&Set.of("M01","M02","M03").contains(kind);
        ResourceAuthorization.require(PortfolioAccess.edit(a,f)||offline);
        if(f.isPublished())throw new BadRequestException("Cần thu hồi công bố trước khi bổ sung bản ký");
        if(file.isEmpty()||file.getSize()>10*1024*1024)throw new BadRequestException("Bản ký phải có dung lượng từ 1 byte đến 10 MB");
        byte[] bytes=file.getBytes();String mime=detectMime(bytes);
        if(mime==null)throw new BadRequestException("Bản ký chỉ nhận PDF, PNG hoặc JPEG");
        // Offline originals are recorded by the assigned lecturer, without inventing a mentor account.
        PortfolioRevision revision;
        if(offline&&f.getId()==null) {
            f.setStatus("COMPLETED");f.setUpdatedBy(a);f=forms.saveAndFlush(f);
            revision=snapshot(f,a,"OFFLINE_ORIGINAL","Phiếu gốc do cơ quan hoàn thành, giảng viên tiếp nhận",null);
        } else {
            if(f.getId()==null||!Set.of("COMPLETED","APPROVED","SUBMITTED").contains(status(f)))throw new BadRequestException("Hoàn thành nội dung trước khi lưu bản ký");
            revision=revisionId==null?revisions.findFirstByFormIdAndDocxIsNotNullOrderByCreatedAtDesc(f.getId()).orElse(null):revisions.findById(revisionId).orElse(null);
            if(revision==null&&offline)revision=revisions.findByFormIdOrderByCreatedAtDesc(f.getId()).stream().filter(r->"OFFLINE_ORIGINAL".equals(r.getAction())).findFirst().orElse(null);
            if(revision==null||!revision.getForm().getId().equals(f.getId()))throw new BadRequestException("Chọn đúng phiên bản được ký");
        }
        PortfolioSignedFile saved=new PortfolioSignedFile();saved.setForm(f);saved.setRevision(revision);saved.setUploadedBy(a);
        saved.setFileName((file.getOriginalFilename()==null?"Ban-da-ky":file.getOriginalFilename()).replaceAll("[\\\\/\\r\\n]","_"));
        saved.setMimeType(mime);saved.setBytes(bytes);saved=signedFiles.saveAndFlush(saved);
        snapshot(f,a,"SIGNED_FILE","Đã lưu bản ký cho phiên bản "+revision.getId(),null);return fileView(saved);
    }
    @Transactional(readOnly=true)
    public Download signed(UUID placementId,String kind,UUID fileId) {
        InternshipPlacement p=placement(placementId,false);PortfolioForm f=load(p,kind);
        ResourceAuthorization.require(PortfolioAccess.content(actor(),f));
        PortfolioSignedFile file=signedFiles.findById(fileId).orElseThrow(()->new ResourceNotFoundException("PortfolioSignedFile","id",fileId));
        ResourceAuthorization.require(f.getId()!=null&&f.getId().equals(file.getForm().getId()));
        if(publishedReader(actor(),f))ResourceAuthorization.require(currentRevision(f).map(r->r.getId().equals(file.getRevision().getId())).orElse(false));
        return new Download(file.getFileName(),file.getMimeType(),file.getBytes());
    }
    private PortfolioRevision snapshot(PortfolioForm f,User a,String action,String note,byte[] docx) {
        PortfolioRevision r=new PortfolioRevision();r.setForm(f);r.setActor(a);r.setAction(action);r.setNote(note);
        r.setContent(new LinkedHashMap<>(f.getContent()));r.setDocx(docx);return revisions.saveAndFlush(r);
    }
    private FormView view(PortfolioForm f,User a) {
        boolean read=PortfolioAccess.content(a,f),edit=PortfolioAccess.edit(a,f),review="M05".equals(f.getKind())&&PortfolioAccess.lecturer(a,f.getPlacement());
        boolean restricted=publishedReader(a,f);
        UUID visibleRevision=restricted?currentRevision(f).map(PortfolioRevision::getId).orElse(null):null;
        List<RevisionView> history=!read||f.getId()==null||restricted?List.of():revisions.findByFormIdOrderByCreatedAtDesc(f.getId()).stream()
            .map(r->new RevisionView(r.getId(),r.getAction(),r.getActor().getFullName(),r.getNote(),r.getCreatedAt(),r.getDocx()!=null)).toList();
        List<FileView> files=!read||f.getId()==null?List.of():signedFiles.findByFormIdOrderByCreatedAtDesc(f.getId()).stream().filter(file->!restricted||file.getRevision().getId().equals(visibleRevision)).map(this::fileView).toList();
        Map<String,Object> visibleContent=f.getContent();
        if("M02".equals(f.getKind())&&Set.of("DRAFT","REVISION_REQUIRED").contains(status(f)))visibleContent=followingContent(f.getPlacement(),visibleContent);
        return new FormView(f.getId(),f.getKind(),status(f),f.getId()==null?null:f.getVersion(),f.getTemplateVersion(),f.isPublished(),read,edit,review,
            PortfolioAccess.faculty(a,f.getPlacement()),read?visibleContent:null,read?(f.getReport()!=null?f.getReport().getLecturerFeedback():f.getFeedback()):null,f.getUpdatedAt(),history,files);
    }
    private FileView fileView(PortfolioSignedFile f){return new FileView(f.getId(),f.getFileName(),f.getRevision().getId(),f.getCreatedAt());}
    private boolean publishedReader(User a,PortfolioForm f){return PortfolioAccess.confidential(f.getKind())&&(PortfolioAccess.student(a,f.getPlacement())||("M04".equals(f.getKind())&&PortfolioAccess.mentor(a,f.getPlacement())));}
    private Optional<PortfolioRevision> currentRevision(PortfolioForm f){
        if(f.getId()==null)return Optional.empty();
        var doc=revisions.findFirstByFormIdAndDocxIsNotNullOrderByCreatedAtDesc(f.getId());
        return doc.isPresent()?doc:revisions.findByFormIdOrderByCreatedAtDesc(f.getId()).stream().filter(r->"OFFLINE_ORIGINAL".equals(r.getAction())).findFirst();
    }
    private String status(PortfolioForm f){return f.getReport()!=null?f.getReport().getStatus():f.getStatus();}
    private PortfolioForm load(InternshipPlacement p,String kind) {
        if(!KINDS.contains(kind))throw new BadRequestException("Mã biểu mẫu không hợp lệ");
        return forms.findByPlacementIdAndKind(p.getId(),kind).orElseGet(()->{
            PortfolioForm f=new PortfolioForm();f.setPlacement(p);f.setKind(kind);
            Map<String,Object> content=new LinkedHashMap<>();
            if(Set.of("M01","M02").contains(kind)) {
                List<Map<String,Object>> weeks=new ArrayList<>();for(int n=1;n<=weekCount(p);n++)weeks.add(new LinkedHashMap<>(Map.of("week",n,"tasks","","comment","","sessions",0,"hours",0)));
                content.put("weeks",weeks);
            }
            f.setContent("M02".equals(kind)?followingContent(p,content):clean(kind,content,weekCount(p)));return f;
        });
    }
    private Map<String,Object> followingContent(InternshipPlacement p,Map<String,Object> existing) {
        var plan=forms.findByPlacementIdAndKind(p.getId(),"M01").map(PortfolioForm::getContent).orElse(Map.of());
        List<Map<String,Object>> rows=new ArrayList<>();
        for(var week:daily.aggregate(p)) {
            var planned=rows(plan).stream().filter(r->number(r.get("week")).intValue()==week.number()).findFirst().orElse(Map.of());
            var old=rows(existing).stream().filter(r->number(r.get("week")).intValue()==week.number()).findFirst().orElse(Map.of());
            Map<String,Object> row=new LinkedHashMap<>();row.put("week",week.number());row.put("tasks",string(planned,"tasks"));
            row.put("comment",string(old,"comment"));row.put("sessions",week.sessions());row.put("hours",week.hours());rows.add(row);
        }
        Map<String,Object> result=new LinkedHashMap<>(existing);result.put("weeks",rows);return canonical(result);
    }
    private void validateLecturerScores(InternshipPlacement p,Map<String,Object> content) {
        if(p.getAssessmentScheme()==null)throw new BadRequestException("Cần phương án đánh giá đã duyệt trước khi hoàn thành M-TT-04");
        var scores=map(content.get("scores"));
        var components=p.getAssessmentScheme().getComponents().stream().filter(c->"LECTURER".equals(c.get("assessorRole"))).toList();
        for(var c:components)if(!scores.containsKey(String.valueOf(c.get("code"))))throw new BadRequestException("Cần chấm đủ thành phần giảng viên theo phương án đánh giá");
        if(scores.keySet().stream().anyMatch(k->components.stream().noneMatch(c->k.equals(c.get("code")))))throw new BadRequestException("Chỉ chấm thành phần được giao cho giảng viên");
    }
    public Map<String,Object> metadata(InternshipPlacement p) {
        Map<String,Object> m=new LinkedHashMap<>();m.put("id",p.getId());m.put("studentName",p.getStudent().getFullName());
        m.put("companyName",p.getCompany()!=null?p.getCompany().getCompanyName():p.getStudentFoundApplication()!=null?p.getStudentFoundApplication().getHostName():"");
        m.put("mentorName",p.getMentor()!=null?p.getMentor().getFullName():p.getStudentFoundApplication()!=null?p.getStudentFoundApplication().getContactName():"");
        m.put("mentorEmail",p.getMentor()!=null?p.getMentor().getEmail():p.getStudentFoundApplication()!=null?p.getStudentFoundApplication().getContactEmail():"");
        m.put("mentorPhone",p.getMentor()!=null?Objects.toString(p.getMentor().getPhoneNumber(),""):"");
        m.put("lecturerName",p.getLecturer()==null?"":p.getLecturer().getFullName());m.put("termName",p.getTerm().getTermName());
        m.put("semester",p.getTerm().getSemester());m.put("academicYear",p.getTerm().getAcademicYear());m.put("departmentName",p.getTerm().getDepartment().getName());
        m.put("startDate",p.getStartDate());m.put("endDate",p.getEndDate());m.put("status",p.getStatus());m.put("source",p.getSource());m.put("weekCount",weekCount(p));
        m.put("workSchedule",p.getWorkSchedule());m.put("hasMentor",p.getMentor()!=null);
        rosters.findByTermIdAndClaimedUserId(p.getTerm().getId(),p.getStudent().getId()).ifPresent(r->{
            m.put("studentCode",r.getStudentCode());m.put("cohort",r.getAcademicYear());m.put("programName",r.getProgram()==null?"":r.getProgram().getName());m.put("courseCode",Objects.toString(r.getInternshipCourseCode(),""));
        });
        if(p.getAssessmentScheme()!=null) {
            var s=p.getAssessmentScheme();m.put("components",s.getComponents());m.put("requiredWeeks",s.getRequiredLogbookWeeks());
            m.put("reportDueAt",s.getFinalReportDueAt());m.put("schemeReference",s.getSourceReference());m.put("courseCode",s.getCourseCode());
        } else m.put("components",List.of());
        return m;
    }
    private int weekCount(InternshipPlacement p){return (int)(ChronoUnit.DAYS.between(p.getStartDate(),p.getEndDate())/7)+1;}
    private String fileName(InternshipPlacement p,String kind){return "M-TT-"+kind.substring(1)+"_"+metadata(p).getOrDefault("studentCode",p.getId().toString())+".docx";}
    private InternshipPlacement placement(UUID id,boolean lock){return(lock?placements.findLockedById(id):placements.findById(id)).orElseThrow(()->new ResourceNotFoundException("InternshipPlacement","id",id));}
    private User actor(){UUID id=security.currentUser().getId();return users.findById(id).orElseThrow(()->new ResourceNotFoundException("User","id",id));}
    private static String detectMime(byte[] b){if(b.length>5&&b[0]=='%'&&b[1]=='P'&&b[2]=='D'&&b[3]=='F'&&b[4]=='-')return "application/pdf";if(b.length>8&&(b[0]&255)==137&&b[1]=='P'&&b[2]=='N'&&b[3]=='G')return "image/png";if(b.length>3&&(b[0]&255)==255&&(b[1]&255)==216&&(b[2]&255)==255)return "image/jpeg";return null;}
    public record BytesFile(String name,String contentType,byte[] bytes) implements MultipartFile {
        public String getName(){return "file";} public String getOriginalFilename(){return name;}public String getContentType(){return contentType;}
        public boolean isEmpty(){return bytes.length==0;}public long getSize(){return bytes.length;}public byte[] getBytes(){return bytes;}
        public InputStream getInputStream(){return new ByteArrayInputStream(bytes);}public void transferTo(File file)throws IOException{java.nio.file.Files.write(file.toPath(),bytes);}
    }
}
