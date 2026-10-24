package com.internlink.core.application.organization;

import com.internlink.core.shared.enums.ReportTemplateType;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

@Component
public class SampleTemplateDocumentGenerator {

    public Resource generateSample(String title, ReportTemplateType type, String programCode) {
        String docTitle = title != null && !title.isBlank() ? title : resolveDefaultTitle(type, programCode);
        String htmlContent = buildWordHtml(docTitle, type, programCode);
        byte[] bytes = htmlContent.getBytes(StandardCharsets.UTF_8);
        return new ByteArrayResource(bytes);
    }

    public String resolveDefaultFileName(ReportTemplateType type, String programCode) {
        String prog = (programCode != null && !programCode.isBlank()) ? programCode.toUpperCase() : "CHUNG";
        return switch (type) {
            case M01 -> "M-TT-01-Ke_hoach_thuc_tap.doc";
            case M02 -> "M-TT-02-Nhat_ky_thuc_tap.doc";
            case M03 -> "M-TT-03-Phieu_danh_gia_Doanh_nghiep.doc";
            case M04, M04_LECTURER_KHMT, M04_LECTURER_MMT, M04_LECTURER_COMMON -> "M-TT-04-Phieu_danh_gia_GVHD-" + prog + ".doc";
            case M05, M05_REPORT_GUIDELINE, FINAL_REPORT -> "M-TT-05-Bao_cao_tong_ket_thuc_tap.doc";
            case FORM_04_RECEPTION_8W -> "04-Phieu_tiep_nhan_sinh_vien_8_tuan.doc";
            case FORM_04_RECEPTION_12W -> "04-Phieu_tiep_nhan_sinh_vien_12_tuan.doc";
            default -> "Bieu_mau_thuc_tap_" + type.name() + ".doc";
        };
    }

    private String resolveDefaultTitle(ReportTemplateType type, String programCode) {
        String progDesc = (programCode != null && !programCode.equals("DEFAULT")) ? " - Ngành " + programCode : "";
        return switch (type) {
            case M01 -> "M-TT-01: Kế Hoạch & Thỏa Thuận Thực Tập";
            case M02 -> "M-TT-02: Nhật Ký Tiến Độ Thực Tập";
            case M03 -> "M-TT-03: Phiếu Đánh Giá Thực Tập Của Doanh Nghiệp";
            case M04, M04_LECTURER_KHMT, M04_LECTURER_MMT, M04_LECTURER_COMMON -> "M-TT-04: Phiếu Đánh Giá Kết Quả Thực Tập Dành Cho Giảng Viên Hướng Dẫn" + progDesc;
            case M05, M05_REPORT_GUIDELINE, FINAL_REPORT -> "M-TT-05: Mẫu Đề Cương & Báo Cáo Tổng Kết Thực Tập Tốt Nghiệp";
            case FORM_04_RECEPTION_8W -> "Biểu mẫu 04: Phiếu Tiếp Nhận Sinh Viên Thực Tập (8 Tuần)";
            case FORM_04_RECEPTION_12W -> "Biểu mẫu 04: Phiếu Tiếp Nhận Sinh Viên Thực Tập (12 Tuần)";
            default -> "Biểu Mẫu Quy Định Thực Tập - " + type.name();
        };
    }

    private String buildWordHtml(String title, ReportTemplateType type, String programCode) {
        return """
            <html xmlns:o='urn:schemas-microsoft-com:office:office'
                  xmlns:w='urn:schemas-microsoft-com:office:word'
                  xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
            <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">
            <!--[if gte mso 9]>
            <xml>
             <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
             </w:WordDocument>
            </xml>
            <![endif]-->
            <style>
              @page { size: 21.0cm 29.7cm; margin: 2.0cm 2.0cm 2.0cm 2.5cm; }
              body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.3; }
              table { width: 100%%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px; }
              th, td { border: 1px solid #000; padding: 6px 8px; font-size: 12pt; vertical-align: top; }
              .header-table td { border: none; padding: 2px 4px; }
              .title { text-align: center; font-size: 15pt; font-weight: bold; margin: 16px 0 8px 0; }
              .subtitle { text-align: center; font-size: 13pt; font-style: italic; margin-bottom: 16px; }
              .section-heading { font-weight: bold; margin-top: 12px; margin-bottom: 4px; }
              .signature-table td { border: none; text-align: center; padding-top: 25px; }
            </style>
            </head>
            <body>
              <table class=\"header-table\">
                <tr>
                  <td style=\"width: 45%%; text-align: center;\">
                    TRƯỜNG ĐẠI HỌC CÔNG NGHỆ THÔNG TIN<br>
                    <b>KHOA CÔNG NGHỆ THÔNG TIN</b><br>
                    -------------------------
                  </td>
                  <td style=\"width: 55%%; text-align: center;\">
                    <b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><br>
                    <b>Độc lập - Tự do - Hạnh phúc</b><br>
                    -------------------------
                  </td>
                </tr>
              </table>

              <div class=\"title\">%s</div>
              <div class=\"subtitle\">(Áp dụng cho học phần Thực tập thực tế - Hệ chính quy)</div>

              <div class=\"section-heading\">I. THÔNG TIN SINH VIÊN & ĐƠN VỊ THỰC TẬP</div>
              <table>
                <tr>
                  <td style=\"width: 25%%;\"><b>Họ và tên sinh viên:</b></td>
                  <td style=\"width: 40%%;\">......................................................</td>
                  <td style=\"width: 15%%;\"><b>Mã số SV:</b></td>
                  <td style=\"width: 20%%;\">......................</td>
                </tr>
                <tr>
                  <td><b>Lớp sinh hoạt:</b></td>
                  <td>......................................................</td>
                  <td><b>Ngành học:</b></td>
                  <td>%s</td>
                </tr>
                <tr>
                  <td><b>Cơ quan thực tập:</b></td>
                  <td colspan=\"3\">................................................................................................................</td>
                </tr>
                <tr>
                  <td><b>Giảng viên hướng dẫn:</b></td>
                  <td colspan=\"3\">................................................................................................................</td>
                </tr>
                <tr>
                  <td><b>Cán bộ hướng dẫn (Mentor):</b></td>
                  <td colspan=\"3\">................................................................................................................</td>
                </tr>
              </table>

              <div class=\"section-heading\">II. NỘI DUNG ĐÁNH GIÁ VÀ XÁC NHẬN CHUYÊN MÔN</div>
              <table>
                <thead>
                  <tr style=\"background-color: #f2f2f2;\">
                    <th style=\"width: 8%%; text-align: center;\">STT</th>
                    <th style=\"width: 52%%; text-align: center;\">Tiêu chí đánh giá / Nội dung công việc</th>
                    <th style=\"width: 20%%; text-align: center;\">Thang điểm</th>
                    <th style=\"width: 20%%; text-align: center;\">Điểm đạt được</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style=\"text-align: center;\">1</td>
                    <td>Ý thức tổ chức kỷ luật, tuân thủ nội quy và tiến độ báo cáo</td>
                    <td style=\"text-align: center;\">2.0 / 10</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td style=\"text-align: center;\">2</td>
                    <td>Kiến thức chuyên môn và năng lực giải quyết công việc thực tế</td>
                    <td style=\"text-align: center;\">5.0 / 10</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td style=\"text-align: center;\">3</td>
                    <td>Kỹ năng làm việc nhóm, giao tiếp và tinh thần học hỏi</td>
                    <td style=\"text-align: center;\">1.0 / 10</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td style=\"text-align: center;\">4</td>
                    <td>Chất lượng tài liệu, báo cáo kết quả thực tập (M-TT-05)</td>
                    <td style=\"text-align: center;\">2.0 / 10</td>
                    <td></td>
                  </tr>
                  <tr style=\"font-weight: bold; background-color: #fafafa;\">
                    <td colspan=\"2\" style=\"text-align: right;\">TỔNG ĐIỂM (Hệ 10):</td>
                    <td style=\"text-align: center;\">10.0</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>

              <div class=\"section-heading\">III. NHẬN XÉT CỦA GIẢNG VIÊN / CÁN BỘ HƯỚNG DẪN</div>
              <p>.......................................................................................................................................................................</p>
              <p>.......................................................................................................................................................................</p>
              <p>.......................................................................................................................................................................</p>

              <table class=\"signature-table\">
                <tr>
                  <td style=\"width: 50%%;\">
                    <b>SINH VIÊN THỰC HIỆN</b><br>
                    <i>(Ký và ghi rõ họ tên)</i>
                  </td>
                  <td style=\"width: 50%%;\">
                    <i>Ngày ..... tháng ..... năm 202...</i><br>
                    <b>NGƯỜI HƯỚNG DẪN / GIẢNG VIÊN</b><br>
                    <i>(Ký, ghi rõ họ tên và đóng dấu nếu có)</i>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """.formatted(title, (programCode != null && !programCode.isBlank()) ? programCode : "Chính quy CNTT");
    }
}
