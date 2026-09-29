package com.internlink.core.application.portfolio;

import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.placement.*;
import com.internlink.core.infrastructure.persistence.jpa.*;
import com.internlink.core.application.placement.WeeklyLogbookService;
import com.internlink.core.presentation.placement.dto.request.WeeklyLogbookRequest;
import com.internlink.core.presentation.placement.dto.response.WeeklyLogbookResponse;
import com.internlink.core.shared.enums.*;
import com.internlink.core.shared.exception.*;
import com.internlink.core.shared.security.*;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.*;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class DailyJournalService {
    private final JpaDailyJournalRepository journals;
    private final JpaInternshipPlacementRepository placements;
    private final JpaUserRepository users;
    private final JpaWeeklyLogbookRepository weekly;
    private final WeeklyLogbookService weeklyService;
    private final SecurityGuard security;

    public record Input(Integer version, @NotBlank String attendance, LocalTime startTime, LocalTime endTime,
        @Min(0) @Max(720) int breakMinutes, @Min(0) @Max(2) int sessions,
        @Size(max=3000000) String tasks,@Size(max=3000000) String results,
        @Size(max=1000000) String reflection,@Size(max=10000) String evidence, boolean submit) {}
    public record Review(@NotBlank String decision,@Size(max=4000) String note,@NotNull Integer version) {}
    public record View(UUID id,LocalDate workDate,String attendance,LocalTime startTime,LocalTime endTime,
        int breakMinutes,int sessions,BigDecimal hours,String tasks,String results,String reflection,String evidence,
        String status,String reviewNote,String reviewer,OffsetDateTime submittedAt,OffsetDateTime reviewedAt,
        Integer version) {}
    public record Week(int number,LocalDate start,LocalDate end,int submittedDays,int confirmedDays,
        int sessions,BigDecimal hours,String tasks,String results,String reflection,String status,UUID logbookId) {}

    @Transactional(readOnly=true)
    public List<View> list(UUID placementId) {
        InternshipPlacement p=placement(placementId,false); requireRead(p);
        return journals.findByPlacementIdOrderByWorkDateAsc(placementId).stream().map(this::view).toList();
    }

    @Transactional
    public View save(UUID placementId,LocalDate date,Input in) {
        InternshipPlacement p=placement(placementId,true); User a=actor();
        ResourceAuthorization.require(PortfolioAccess.student(a,p)); active(p);
        if (date.isBefore(p.getStartDate()) || date.isAfter(p.getEndDate()) || date.isAfter(LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"))))
            throw new BadRequestException("Ngày nhật ký phải thuộc kỳ thực tập và không ở tương lai");
        unlockedWeek(p,date);
        DailyJournal j=journals.findByPlacementIdAndWorkDate(placementId,date).orElseGet(()->{
            DailyJournal value=new DailyJournal(); value.setPlacement(p); value.setWorkDate(date); return value;
        });
        checkVersion(j.getId()!=null?j.getVersion():null,in.version());
        if (!Set.of("DRAFT","REVISION_REQUIRED").contains(j.getStatus())) throw new BadRequestException("Nhật ký đã gửi; người xác nhận cần yêu cầu sửa trước khi cập nhật");
        if (!Set.of("PRESENT","REMOTE","LEAVE","ABSENT","DAY_OFF").contains(in.attendance())) throw new BadRequestException("Tình trạng tham gia không hợp lệ");
        boolean working=Set.of("PRESENT","REMOTE").contains(in.attendance());
        BigDecimal hours=BigDecimal.ZERO;
        if (working) {
            if (in.startTime()==null || in.endTime()==null || !in.endTime().isAfter(in.startTime()))
                throw new BadRequestException("Nhập giờ bắt đầu và kết thúc hợp lệ trong ngày");
            long minutes=Duration.between(in.startTime(),in.endTime()).toMinutes()-in.breakMinutes();
            if (minutes<=0 || in.sessions()<1) throw new BadRequestException("Số buổi và thời gian làm việc phải lớn hơn 0");
            hours=BigDecimal.valueOf(minutes).divide(BigDecimal.valueOf(60),2,RoundingMode.HALF_UP);
        }
        String tasks=RichText.clean(in.tasks()), results=RichText.clean(in.results()), reflection=RichText.clean(in.reflection());
        if (in.submit() && working && (RichText.text(tasks).isBlank() || RichText.text(results).isBlank()))
            throw new BadRequestException("Cần ghi công việc đã làm và kết quả trong ngày");
        if (in.submit() && !working && RichText.text(reflection).isBlank()) throw new BadRequestException("Ghi lý do nghỉ/vắng trong phần khó khăn và ghi chú");
        j.setAttendance(in.attendance()); j.setStartTime(working?in.startTime():null); j.setEndTime(working?in.endTime():null);
        j.setBreakMinutes(working?in.breakMinutes():0); j.setSessions(working?in.sessions():0); j.setHours(hours);
        j.setTasks(tasks); j.setResults(results); j.setReflection(reflection); j.setEvidence(in.evidence()==null?"":in.evidence().trim());
        if (in.submit()) { j.setStatus("SUBMITTED"); j.setSubmittedAt(OffsetDateTime.now()); j.setReviewedBy(null); j.setReviewedAt(null); j.setReviewNote(null); }
        return view(journals.saveAndFlush(j));
    }

    @Transactional
    public View review(UUID placementId,LocalDate date,Review in) {
        InternshipPlacement p=placement(placementId,true); User a=actor();
        ResourceAuthorization.require(PortfolioAccess.confirmDaily(a,p)); active(p); unlockedWeek(p,date);
        DailyJournal j=journals.findByPlacementIdAndWorkDate(placementId,date).orElseThrow(()->new BadRequestException("Chưa có nhật ký cho ngày này"));
        checkVersion(j.getVersion(),in.version());
        if (!Set.of("CONFIRMED","REVISION_REQUIRED").contains(in.decision()) ||
            !("SUBMITTED".equals(j.getStatus()) || ("CONFIRMED".equals(j.getStatus()) && "REVISION_REQUIRED".equals(in.decision()))))
            throw new BadRequestException("Trạng thái xác nhận không hợp lệ");
        if ("REVISION_REQUIRED".equals(in.decision()) && (in.note()==null || in.note().isBlank())) throw new BadRequestException("Cần ghi nội dung yêu cầu bổ sung");
        j.setStatus(in.decision()); j.setReviewNote(in.note()); j.setReviewedBy(a); j.setReviewedAt(OffsetDateTime.now());
        return view(journals.saveAndFlush(j));
    }

    @Transactional(readOnly=true)
    public List<Week> weeks(UUID placementId) {
        InternshipPlacement p=placement(placementId,false); requireRead(p); return aggregate(p);
    }

    @Transactional
    public WeeklyLogbookResponse submitWeek(UUID placementId,int number) {
        InternshipPlacement p=placement(placementId,true); User a=actor();
        ResourceAuthorization.require(PortfolioAccess.student(a,p)); active(p);
        Week w=aggregate(p).stream().filter(v->v.number()==number).findFirst().orElseThrow(()->new BadRequestException("Tuần không hợp lệ"));
        if (w.end().isAfter(LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")))) throw new BadRequestException("Chỉ tổng hợp khi tuần đã kết thúc");
        if (w.confirmedDays()==0) throw new BadRequestException("Chưa có nhật ký ngày được xác nhận");
        boolean unresolved=journals.findByPlacementIdOrderByWorkDateAsc(placementId).stream()
            .anyMatch(j->!j.getWorkDate().isBefore(w.start())&&!j.getWorkDate().isAfter(w.end())&&!"CONFIRMED".equals(j.getStatus()));
        if (unresolved) throw new BadRequestException("Còn nhật ký ngày chưa được xác nhận trong tuần");
        return weeklyService.submitLogbook(a.getId(),new WeeklyLogbookRequest(placementId,number,w.start(),w.end(),
            w.tasks().isBlank()?"Không phát sinh công việc; xem nhật ký ngày đã xác nhận.":w.tasks(),
            w.reflection().isBlank()?"Xem kết quả trong nhật ký ngày.":w.reflection(),w.hours()));
    }

    public List<Week> aggregate(InternshipPlacement p) {
        List<DailyJournal> all=journals.findByPlacementIdOrderByWorkDateAsc(p.getId());
        var existing=weekly.findByPlacementIdOrderByWeekNumberAsc(p.getId());
        int count=(int)(ChronoUnit.DAYS.between(p.getStartDate(),p.getEndDate())/7)+1;
        List<Week> result=new ArrayList<>();
        for(int n=1;n<=count;n++) {
            LocalDate start=p.getStartDate().plusWeeks(n-1),end=start.plusDays(6).isAfter(p.getEndDate())?p.getEndDate():start.plusDays(6);
            var days=all.stream().filter(j->!j.getWorkDate().isBefore(start)&&!j.getWorkDate().isAfter(end)).toList();
            var confirmed=days.stream().filter(j->"CONFIRMED".equals(j.getStatus())).toList();
            final int week=n;
            var log=existing.stream().filter(l->l.getWeekNumber()==week).findFirst().orElse(null);
            result.add(new Week(n,start,end,(int)days.stream().filter(j->!"DRAFT".equals(j.getStatus())).count(),confirmed.size(),
                confirmed.stream().mapToInt(DailyJournal::getSessions).sum(),confirmed.stream().map(DailyJournal::getHours).reduce(BigDecimal.ZERO,BigDecimal::add),
                join(confirmed,"tasks"),join(confirmed,"results"),join(confirmed,"reflection"),log==null?"NOT_SUBMITTED":log.getStatus().name(),log==null?null:log.getId()));
        }
        return result;
    }
    private String join(List<DailyJournal> days,String field) {
        return days.stream().map(j->j.getWorkDate()+": "+RichText.text(switch(field){case "tasks"->j.getTasks();case "results"->j.getResults();default->j.getReflection();}))
            .collect(Collectors.joining("\n"));
    }
    private void unlockedWeek(InternshipPlacement p,LocalDate date) {
        int n=(int)(ChronoUnit.DAYS.between(p.getStartDate(),date)/7)+1;
        weekly.findByPlacementIdAndWeekNumber(p.getId(),n).ifPresent(w->{
            if (w.getStatus()!=LogbookStatus.REVISION_REQUESTED && w.getStatus()!=LogbookStatus.DRAFT)
                throw new BadRequestException("Tuần đã gửi/duyệt; cần yêu cầu sửa nhật ký tuần trước");
        });
    }
    private View view(DailyJournal j) { return new View(j.getId(),j.getWorkDate(),j.getAttendance(),j.getStartTime(),j.getEndTime(),j.getBreakMinutes(),j.getSessions(),j.getHours(),j.getTasks(),j.getResults(),j.getReflection(),j.getEvidence(),j.getStatus(),j.getReviewNote(),j.getReviewedBy()==null?null:j.getReviewedBy().getFullName(),j.getSubmittedAt(),j.getReviewedAt(),j.getVersion()); }
    private InternshipPlacement placement(UUID id,boolean lock) { return (lock?placements.findLockedById(id):placements.findById(id)).orElseThrow(()->new ResourceNotFoundException("InternshipPlacement","id",id)); }
    private User actor() { UUID id=security.currentUser().getId(); return users.findById(id).orElseThrow(()->new ResourceNotFoundException("User","id",id)); }
    private void requireRead(InternshipPlacement p) { ResourceAuthorization.require(PortfolioAccess.read(actor(),p)); }
    public static void active(InternshipPlacement p) { if(p.getStatus()!=PlacementStatus.ACTIVE) throw new BadRequestException("Chỉ cập nhật khi kỳ thực tập đang hoạt động"); }
    public static void checkVersion(Integer actual,Integer expected) { if(!Objects.equals(actual,expected)) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,"Dữ liệu đã thay đổi. Hãy tải lại trước khi lưu để tránh ghi đè."); }
}
