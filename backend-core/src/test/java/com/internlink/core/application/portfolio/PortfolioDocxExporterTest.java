package com.internlink.core.application.portfolio;
import org.junit.jupiter.api.Test;
import java.io.*;
import java.nio.file.*;
import java.time.LocalDate;
import java.util.*;
import java.util.zip.*;
import static org.assertj.core.api.Assertions.*;

class PortfolioDocxExporterTest {
    @Test void exportsAllFormsAsEditableWordAndReportKeepsPrivateGradesBlank()throws Exception {
        var exporter=new PortfolioDocxExporter();Map<String,Object> meta=new LinkedHashMap<>(Map.of("studentName","Sinh viên kiểm thử","studentCode","TEST001","companyName","Đơn vị kiểm thử","mentorName","Người hướng dẫn","lecturerName","Giảng viên","departmentName","TRƯỜNG CÔNG NGHỆ THÔNG TIN VÀ TRUYỀN THÔNG","startDate",LocalDate.of(2026,1,5),"endDate",LocalDate.of(2026,3,29),"termName","Học kỳ kiểm thử"));
        meta.put("components",List.of(Map.of("code","REPORT","name","Báo cáo","weight",1,"assessorRole","LECTURER")));meta.put("schemeReference","Phương án kiểm thử");
        var weeks=new ArrayList<Map<String,Object>>();for(int n=1;n<=12;n++)weeks.add(Map.of("week",n,"tasks","<p>Tìm hiểu hệ thống, triển khai chức năng và kiểm thử kết quả công việc.</p>","comment","<p>Đã hoàn thành công việc.</p>","sessions",10,"hours",40));
        var sections=new LinkedHashMap<String,Object>();for(var key:PortfolioContent.SECTION_KEYS)sections.put(key,"<p style='text-align:justify'><strong>Nội dung kiểm thử tiếng Việt.</strong> Báo cáo mô tả công việc đã thực hiện và kết quả đạt được.</p><h2>Mục chi tiết</h2><table><tr><th>Công việc</th><th>Kết quả</th></tr><tr><td>Kiểm thử</td><td>Đạt</td></tr></table><p><em>Hình: Sơ đồ công việc</em></p>");
        Map<String,Object> content=new LinkedHashMap<>(Map.of("weeks",weeks,"sections",sections,"scores",Map.of("REPORT",9.7),"comment","<p>Nhận xét bảo mật</p>","paperSize","LETTER","courseName","Thực tập doanh nghiệp"));
        var folder=Path.of("target","portfolio-qa");Files.createDirectories(folder);
        for(String kind:PortfolioService.KINDS){byte[] data=exporter.export(kind,content,meta,false);Files.write(folder.resolve(kind+".docx"),data);var parts=unzip(data);String xml=parts.get("word/document.xml");assertThat(xml).contains("Sinh viên kiểm thử","w:tbl");
            if(kind.equals("M05")){assertThat(xml).doesNotContain("9.7","Nhận xét bảo mật").contains("lowerRoman","decimal","Caption","TOC","CHƯƠNG IV");}
            if(kind.equals("M01"))assertThat(xml).contains("w:tblHeader","29/03/2026");
        }
    }
    @Test void sanitizesRemoteImagesScriptsAndBadCss(){String value=RichText.clean("<script>alert(1)</script><p onclick='evil()' style='text-align:center;background:url(http://localhost);font-size:13pt'>Xin chào</p><img src='http://localhost/secret'/>");assertThat(value).doesNotContain("script","onclick","localhost","background").contains("text-align:center","font-size:13pt");}
    @Test void skipsRemoteCriteriaAndRejectsFractionalWeek(){var content=PortfolioContent.clean("M03",Map.of("remote",true,"scores",Map.of("0",9,"3",8)),12);assertThat(PortfolioContent.map(content.get("scores"))).containsOnlyKeys("3");assertThatThrownBy(()->PortfolioContent.clean("M01",Map.of("weeks",List.of(Map.of("week",1.5))),12)).isInstanceOf(com.internlink.core.shared.exception.BadRequestException.class);}
    private Map<String,String> unzip(byte[] bytes)throws IOException{var result=new HashMap<String,String>();try(var zip=new ZipInputStream(new ByteArrayInputStream(bytes))){for(ZipEntry e;(e=zip.getNextEntry())!=null;)if(e.getName().endsWith(".xml"))result.put(e.getName(),new String(zip.readAllBytes(),java.nio.charset.StandardCharsets.UTF_8));}return result;}
}
