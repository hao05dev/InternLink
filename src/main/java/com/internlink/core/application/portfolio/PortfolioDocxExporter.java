package com.internlink.core.application.portfolio;

import org.docx4j.XmlUtils;
import org.docx4j.convert.in.xhtml.XHTMLImporterImpl;
import org.docx4j.openpackaging.packages.WordprocessingMLPackage;
import org.docx4j.openpackaging.parts.WordprocessingML.FooterPart;
import org.docx4j.wml.*;
import org.springframework.stereotype.Component;
import java.io.*;
import java.math.BigInteger;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import static com.internlink.core.application.portfolio.PortfolioContent.*;
import static com.internlink.core.application.portfolio.RichText.escape;

/** Produces real OOXML, with editable text/tables and native Word fields. */
@Component
public class PortfolioDocxExporter {
    public static final String MIME="application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    private static final String W="http://schemas.openxmlformats.org/wordprocessingml/2006/main";
    private static final DateTimeFormatter DATE=DateTimeFormatter.ofPattern("dd/MM/yyyy");
    public byte[] export(String kind,Map<String,Object> content,Map<String,Object> meta,boolean draft) {
        try {
            WordprocessingMLPackage pkg=WordprocessingMLPackage.createPackage();
            configure(pkg,"M05".equals(kind)&&!"A4".equals(content.get("paperSize")));
            if("M05".equals(kind))report(pkg,content,meta,draft);
            else {
                append(pkg,"<p style='text-align:right'>M-TT-"+kind.substring(1)+"</p>"+(draft?"<p style='text-align:right'>BẢN NHÁP</p>":""));
                String title=switch(kind){case "M01"->"PHIẾU GIAO VIỆC CHO SINH VIÊN THỰC TẬP THỰC TẾ";case "M02"->"PHIẾU THEO DÕI SINH VIÊN THỰC TẬP THỰC TẾ";case "M03"->"PHIẾU ĐÁNH GIÁ KẾT QUẢ THỰC TẬP";default->"PHIẾU ĐÁNH GIÁ BÁO CÁO KẾT QUẢ THỰC TẬP";};
                append(pkg,"<h2 style='text-align:center'>"+title+"</h2><p style='text-align:center'><b>"+escape(meta.get("termName"))+"</b></p>"+identity(meta));
                if(Set.of("M01","M02").contains(kind))weeklyTable(pkg,kind,content,meta);
                if("M03".equals(kind))assessment(pkg,content,meta);
                if("M04".equals(kind))lecturerTable(pkg,content,meta,false);
                signatures(pkg,kind,content,meta);
            }
            repeatTableHeaders(pkg);
            normalizeStyles(pkg);
            if("M03".equals(kind))compactAssessment(pkg);
            ByteArrayOutputStream out=new ByteArrayOutputStream();pkg.save(out);return out.toByteArray();
        }catch(Exception ex){throw new IllegalStateException("Không thể tạo file Word. Nội dung đã lưu vẫn được giữ lại.",ex);}
    }
    private void configure(WordprocessingMLPackage pkg,boolean letter)throws Exception {
        var section=pkg.getDocumentModel().getSections().get(0).getSectPr();
        var size=new SectPr.PgSz();size.setW(BigInteger.valueOf(letter?12240:11906));size.setH(BigInteger.valueOf(letter?15840:16838));section.setPgSz(size);
        var margins=new SectPr.PgMar();margins.setTop(BigInteger.valueOf(1440));margins.setBottom(BigInteger.valueOf(1440));margins.setLeft(BigInteger.valueOf(1701));margins.setRight(BigInteger.valueOf(1134));margins.setHeader(BigInteger.valueOf(600));margins.setFooter(BigInteger.valueOf(600));margins.setGutter(BigInteger.ZERO);section.setPgMar(margins);
        var defaults=pkg.getMainDocumentPart().getStyleDefinitionsPart().getJaxbElement().getDocDefaults();
        var rPr=new RPr();var fonts=new RFonts();fonts.setAscii("Times New Roman");fonts.setHAnsi("Times New Roman");fonts.setEastAsia("Times New Roman");rPr.setRFonts(fonts);var sz=new HpsMeasure();sz.setVal(BigInteger.valueOf(26));rPr.setSz(sz);
        if(defaults==null){defaults=new DocDefaults();pkg.getMainDocumentPart().getStyleDefinitionsPart().getJaxbElement().setDocDefaults(defaults);}
        var rd=new DocDefaults.RPrDefault();rd.setRPr(rPr);defaults.setRPrDefault(rd);
        FooterPart footer=new FooterPart();footer.setJaxbElement((Ftr)XmlUtils.unmarshalString("<w:ftr xmlns:w='"+W+"'><w:p><w:pPr><w:jc w:val='center'/></w:pPr><w:fldSimple w:instr='PAGE'/></w:p></w:ftr>"));
        var relationship=pkg.getMainDocumentPart().addTargetPart(footer);var ref=new FooterReference();ref.setType(HdrFtrRef.DEFAULT);ref.setId(relationship.getId());section.getEGHdrFtrReferences().add(ref);
        var settings=pkg.getMainDocumentPart().getDocumentSettingsPart();if(settings!=null){var on=new BooleanDefaultTrue();on.setVal(true);settings.getJaxbElement().setUpdateFields(on);}
    }
    private void append(WordprocessingMLPackage pkg,String html)throws Exception {
        var importer=new XHTMLImporterImpl(pkg);
        String xhtml="<html xmlns='http://www.w3.org/1999/xhtml'><head><style>body{font-family:'Times New Roman';font-size:13pt;}p{margin:0 0 6pt 0;line-height:1.3;}h1,h2,h3{font-family:'Times New Roman';color:#000;font-weight:bold;}h1{font-size:16pt;}h2{font-size:14pt;}h3{font-size:13pt;}table{border-collapse:collapse;width:100%;}td,th{border:1px solid #000;padding:5pt;vertical-align:top;font-size:12pt;}th{text-align:center;font-weight:bold;}img{max-width:460px;}a{color:#000;}</style></head><body>"+html+"</body></html>";
        var converted=importer.convert(xhtml,null);
        Map<String,String> headingStyles=new HashMap<>();
        org.jsoup.Jsoup.parseBodyFragment(html).select("h2,h3,h4").forEach(h->headingStyles.put(h.text(),"Heading"+h.tagName().substring(1)));
        for(String styleId:new HashSet<>(headingStyles.values())){P temporary=pkg.getMainDocumentPart().addStyledParagraphOfText(styleId,"");pkg.getMainDocumentPart().getContent().remove(temporary);}
        for(Object raw:converted)if(XmlUtils.unwrap(raw) instanceof P paragraph && headingStyles.containsKey(paragraphText(paragraph))) {
            if(paragraph.getPPr()==null)paragraph.setPPr(new PPr());var style=new PPrBase.PStyle();style.setVal(headingStyles.get(paragraphText(paragraph)));paragraph.getPPr().setPStyle(style);
        }
        for(Object raw:converted)if(XmlUtils.unwrap(raw) instanceof P paragraph && paragraphText(paragraph).startsWith("Hình:")) {
            if(paragraph.getPPr()==null)paragraph.setPPr(new PPr());
            var style=new PPrBase.PStyle();style.setVal("Caption");paragraph.getPPr().setPStyle(style);
        }
        pkg.getMainDocumentPart().getContent().addAll(converted);
    }
    private String identity(Map<String,Object> m) {
        return "<p>Họ và tên sinh viên: <b>"+escape(m.get("studentName"))+"</b> — MSSV: "+escape(m.get("studentCode"))+"</p><p>Cơ quan thực tập: "+escape(m.get("companyName"))+"</p><p>Cán bộ hướng dẫn: "+escape(m.get("mentorName"))+"</p><p>Thời gian thực tập: từ "+date(m.get("startDate"))+" đến "+date(m.get("endDate"))+"</p>";
    }
    private void weeklyTable(WordprocessingMLPackage pkg,String kind,Map<String,Object> c,Map<String,Object> m)throws Exception {
        boolean follow="M02".equals(kind);
        StringBuilder html=new StringBuilder("<table><thead><tr><th style='width:13%'>Tuần</th><th>Nội dung công việc được giao</th>");
        html.append(follow?"<th>Nhận xét của cán bộ hướng dẫn</th><th>Số buổi</th><th>Chữ ký CBHD</th>":"<th>Số buổi / giờ dự kiến</th>").append("</tr></thead><tbody>");
        LocalDate first=LocalDate.parse(String.valueOf(m.get("startDate"))),last=LocalDate.parse(String.valueOf(m.get("endDate")));
        for(var row:rows(c)) {
            int week=number(row.get("week")).intValue();LocalDate start=first.plusWeeks(week-1),end=start.plusDays(6).isAfter(last)?last:start.plusDays(6);
            html.append("<tr><td>").append(week).append("<br/>").append(date(start)).append("<br/>– ").append(date(end)).append("</td><td>").append(RichText.clean(string(row,"tasks"))).append("</td>");
            if(follow)html.append("<td>").append(RichText.clean(string(row,"comment"))).append("</td><td>").append(escape(row.get("sessions"))).append("</td><td></td>");
            else html.append("<td>").append(escape(row.get("sessions"))).append(" buổi<br/>").append(escape(row.get("hours"))).append(" giờ</td>");
            html.append("</tr>");
        }
        append(pkg,html.append("</tbody></table>").toString());
    }
    private void assessment(WordprocessingMLPackage pkg,Map<String,Object> c,Map<String,Object> m)throws Exception {
        append(pkg,"<p>Điện thoại: "+escape(m.get("mentorPhone"))+" — Email: "+escape(m.get("mentorEmail"))+"</p>");
        var scores=map(c.get("scores"));boolean remote=Boolean.TRUE.equals(c.get("remote"));java.math.BigDecimal total=java.math.BigDecimal.ZERO;
        StringBuilder html=new StringBuilder("<table><thead><tr><th>Nội dung đánh giá</th><th>Điểm (1–10)</th></tr></thead><tbody>");
        for(int i=0;i<CRITERIA.size();i++){
            if(i==0||i==4||i==7)html.append("<tr><td colspan='2'><b>").append(i==0?"I. Tinh thần kỷ luật":i==4?"II. Khả năng chuyên môn, nghiệp vụ":"III. Kết quả công tác").append("</b></td></tr>");
            String value=remote&&i<3?"Không áp dụng":scores.containsKey(String.valueOf(i))?String.valueOf(scores.get(String.valueOf(i))):"";
            if(!(remote&&i<3)&&scores.containsKey(String.valueOf(i)))total=total.add(number(scores.get(String.valueOf(i))));
            html.append("<tr><td>").append(CRITERIA.get(i)).append("</td><td>").append(escape(value)).append("</td></tr>");
        }
        html.append("<tr><td><b>Cộng điểm tiêu chí áp dụng</b></td><td>").append(total.toPlainString()).append(" / ").append(remote?70:100).append("</td></tr></tbody></table>");
        html.append("<p><b>1. Nhận xét khác về sinh viên</b></p>").append(RichText.clean(string(c,"comment")));
        html.append("<p><b>2. Đánh giá của cơ quan về chương trình đào tạo</b></p>");
        List<?> selected=c.get("trainingFeedback") instanceof List<?> l?l:List.of();
        for(String label:TRAINING)html.append("<p>").append(selected.contains(label)?"☒ ":"☐ ").append(label).append("</p>");
        html.append("<p><b>3. Đề xuất góp ý của cơ quan về chương trình đào tạo</b></p>").append(RichText.clean(string(c,"suggestions")));append(pkg,html.toString());
    }
    private void lecturerTable(WordprocessingMLPackage pkg,Map<String,Object> c,Map<String,Object> m,boolean blank)throws Exception {
        StringBuilder html=new StringBuilder("<p>Giảng viên chấm báo cáo: "+escape(m.get("lecturerName"))+"</p><table><thead><tr><th>Nội dung đánh giá theo phương án được duyệt</th><th>Trọng số</th><th>Điểm (0–10)</th></tr></thead><tbody>");
        var scores=map(c.get("scores"));List<?> components=m.get("components") instanceof List<?> l?l:List.of();
        for(Object value:components) {var part=map(value);html.append("<tr><td>").append(escape(part.get("name"))).append("</td><td>").append(number(part.get("weight")).multiply(java.math.BigDecimal.valueOf(100)).stripTrailingZeros().toPlainString()).append("%</td><td>").append(blank?"":escape(scores.get(String.valueOf(part.get("code"))))).append("</td></tr>");}
        if(components.isEmpty())html.append("<tr><td colspan='3'>Chưa có phương án đánh giá được duyệt cho học phần.</td></tr>");
        html.append("</tbody></table><p>Nguồn phương án: ").append(escape(m.get("schemeReference"))).append("</p><p>Nhận xét:</p>").append(blank?"":RichText.clean(string(c,"comment")));
        append(pkg,html.toString());
    }
    private void signatures(WordprocessingMLPackage pkg,String kind,Map<String,Object> c,Map<String,Object> m)throws Exception {
        append(pkg,"<p style='text-align:right'>"+escape(string(c,"place"))+", ngày …… tháng …… năm ……</p>");
        if("M04".equals(kind)){append(pkg,"<p style='text-align:right'><b>GIẢNG VIÊN CHẤM BÁO CÁO</b></p><p style='text-align:right'>(Ký và ghi rõ họ tên)</p>");return;}
        String html="<table><tr><td style='text-align:center'><b>Xác nhận của cơ quan<br/>Thủ trưởng</b><br/>(Ký tên, đóng dấu)<p> </p><p> </p></td>";
        if("M01".equals(kind))html+="<td style='text-align:center'><b>Sinh viên</b><br/>(Ký tên và ghi họ tên)<p> </p><p> </p></td>";
        html+="<td style='text-align:center'><b>Cán bộ hướng dẫn</b><br/>(Ký tên và ghi họ tên)<p> </p><p> </p></td></tr></table>";
        append(pkg,html.replace("<table>","<table style='border:0'>").replace("<td style='", "<td style='border:0;"));
    }
    private void report(WordprocessingMLPackage pkg,Map<String,Object> c,Map<String,Object> m,boolean draft)throws Exception {
        append(pkg,"<p style='text-align:center'>BỘ GIÁO DỤC VÀ ĐÀO TẠO</p><p style='text-align:center'><b>ĐẠI HỌC CẦN THƠ<br/>"+escape(m.get("departmentName"))+"</b></p><p> </p><p> </p><h1 style='text-align:center'>BÁO CÁO THỰC TẬP DOANH NGHIỆP</h1><p style='text-align:center'>NGÀNH "+escape(m.get("programName"))+"</p><p style='text-align:center'>MÃ HỌC PHẦN: "+escape(m.get("courseCode"))+"</p><p style='text-align:center'>TÊN HỌC PHẦN: "+escape(string(c,"courseName"))+"</p><p> </p><p> </p>"+identity(m)+"<p>Giảng viên phụ trách: "+escape(m.get("lecturerName"))+"</p><p>Khóa: "+escape(m.get("cohort"))+"</p>"+(draft?"<p style='text-align:center'>BẢN NHÁP</p>":""));
        sectionBreak(pkg,NumberFormat.LOWER_ROMAN,true);var sections=map(c.get("sections"));heading(pkg,SECTION_TITLES.get(0));append(pkg,RichText.clean(string(sections,"thanks")));
        pageBreak(pkg);heading(pkg,"PHIẾU ĐÁNH GIÁ BÁO CÁO KẾT QUẢ THỰC TẬP — M-TT-04");lecturerTable(pkg,Map.of(),m,true);signatures(pkg,"M04",c,m);
        pageBreak(pkg);append(pkg,"<p style='text-align:center'><b>MỤC LỤC</b></p>");field(pkg,"TOC \\o \"1-3\" \\h \\z \\u","Mở bằng Word và cập nhật mục lục để hiển thị số trang.");
        pageBreak(pkg);append(pkg,"<p style='text-align:center'><b>DANH MỤC HÌNH ẢNH</b></p>");field(pkg,"TOC \\t \"Caption,1\" \\h","Danh mục lấy từ các chú thích hình trong báo cáo.");
        sectionBreak(pkg,NumberFormat.DECIMAL,false);
        for(int i=1;i<SECTION_KEYS.size();i++) {if(i>1)pageBreak(pkg);heading(pkg,SECTION_TITLES.get(i));append(pkg,RichText.clean(string(sections,SECTION_KEYS.get(i))));}
    }
    private void heading(WordprocessingMLPackage pkg,String title){pkg.getMainDocumentPart().addStyledParagraphOfText("Heading1",title);}
    private void normalizeStyles(WordprocessingMLPackage pkg) {
        for(var style:pkg.getMainDocumentPart().getStyleDefinitionsPart().getJaxbElement().getStyle()) {
            if(style.getStyleId().startsWith("Heading")||"Caption".equals(style.getStyleId())) {
                if(style.getRPr()==null)style.setRPr(new RPr());
                var fonts=new RFonts();fonts.setAscii("Times New Roman");fonts.setHAnsi("Times New Roman");style.getRPr().setRFonts(fonts);
                var color=new Color();color.setVal("000000");style.getRPr().setColor(color);
                var size=new HpsMeasure();size.setVal(BigInteger.valueOf("Heading1".equals(style.getStyleId())?28:26));style.getRPr().setSz(size);
            }
        }
    }
    private void compactAssessment(WordprocessingMLPackage pkg) {
        // The original M03 is a one-page form; reduce cell padding while allowing long comments to flow.
        var margins=pkg.getMainDocumentPart().getJaxbElement().getBody().getSectPr().getPgMar();margins.setTop(BigInteger.valueOf(1134));margins.setBottom(BigInteger.valueOf(1134));
        for(Object raw:pkg.getMainDocumentPart().getContent())compactNode(raw);
    }
    private void compactNode(Object raw) {
        Object o=XmlUtils.unwrap(raw);
        if(o instanceof P p){if(p.getPPr()==null)p.setPPr(new PPr());var spacing=new PPrBase.Spacing();spacing.setAfter(BigInteger.valueOf(35));spacing.setBefore(BigInteger.ZERO);spacing.setLine(BigInteger.valueOf(240));spacing.setLineRule(STLineSpacingRule.AUTO);p.getPPr().setSpacing(spacing);}
        if(o instanceof Tc cell){if(cell.getTcPr()==null)cell.setTcPr(new TcPr());var margins=new TcMar();var amount=new TblWidth();amount.setType("dxa");amount.setW(BigInteger.valueOf(25));margins.setTop(amount);margins.setBottom(amount);cell.getTcPr().setTcMar(margins);}
        if(o instanceof Tr row&&row.getTrPr()!=null)row.getTrPr().getCnfStyleOrDivIdOrGridBefore().removeIf(v->XmlUtils.unwrap(v) instanceof CTHeight);
        if(o instanceof ContentAccessor accessor)accessor.getContent().forEach(this::compactNode);
    }
    private void field(WordprocessingMLPackage pkg,String instruction,String placeholder)throws Exception {
        pkg.getMainDocumentPart().getContent().add(XmlUtils.unmarshalString("<w:p xmlns:w='"+W+"'><w:fldSimple w:instr='"+escape(instruction)+"'><w:r><w:t>"+escape(placeholder)+"</w:t></w:r></w:fldSimple></w:p>"));
    }
    private void pageBreak(WordprocessingMLPackage pkg)throws Exception{pkg.getMainDocumentPart().getContent().add(XmlUtils.unmarshalString("<w:p xmlns:w='"+W+"'><w:r><w:br w:type='page'/></w:r></w:p>"));}
    private void repeatTableHeaders(WordprocessingMLPackage pkg){for(Object raw:pkg.getMainDocumentPart().getContent()){Object obj=XmlUtils.unwrap(raw);if(obj instanceof Tbl table&&table.getContent().size()>1){Object first=XmlUtils.unwrap(table.getContent().get(0));if(first instanceof Tr row){if(row.getTrPr()==null)row.setTrPr(new TrPr());row.getTrPr().getCnfStyleOrDivIdOrGridBefore().add(new ObjectFactory().createCTTrPrBaseTblHeader(new BooleanDefaultTrue()));}}}}
    private String paragraphText(Object value){Object o=XmlUtils.unwrap(value);if(o instanceof Text t)return t.getValue();if(o instanceof ContentAccessor c)return c.getContent().stream().map(this::paragraphText).collect(java.util.stream.Collectors.joining());return "";}
    private void sectionBreak(WordprocessingMLPackage pkg,NumberFormat nextFormat,boolean cover) {
        var body=pkg.getMainDocumentPart().getJaxbElement().getBody();var previous=XmlUtils.deepCopy(body.getSectPr());
        if(cover){var title=new BooleanDefaultTrue();previous.setTitlePg(title);}
        var paragraph=new P();var properties=new PPr();properties.setSectPr(previous);paragraph.setPPr(properties);body.getContent().add(paragraph);
        var next=XmlUtils.deepCopy(body.getSectPr());var type=new SectPr.Type();type.setVal("nextPage");next.setType(type);next.setTitlePg(null);
        var numbering=new CTPageNumber();numbering.setFmt(nextFormat);numbering.setStart(BigInteger.ONE);next.setPgNumType(numbering);body.setSectPr(next);
    }
    private String date(Object value){try{return LocalDate.parse(String.valueOf(value)).format(DATE);}catch(Exception e){return escape(value);}}
}
