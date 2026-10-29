package com.internlink.core.application.organization;

import com.internlink.core.infrastructure.integration.storage.OfficialTemplateStore;
import com.internlink.core.shared.enums.ReportTemplateType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

@Slf4j
@Component
@RequiredArgsConstructor
public class SampleTemplateDocumentGenerator {

    private final OfficialTemplateStore officialTemplateStore;

    public Resource generateSample(String title, ReportTemplateType type, String programCode) {
        String officialFile = resolveOfficialFileName(type, programCode);
        if (officialFile != null) {
            Resource officialRes = loadOfficialResource(officialFile);
            if (officialRes != null) {
                return officialRes;
            }
        }

        String docTitle = title != null && !title.isBlank() ? title : resolveDefaultTitle(type, programCode);
        String htmlContent = buildWordHtmlFallback(docTitle, type);
        return new ByteArrayResource(htmlContent.getBytes(StandardCharsets.UTF_8));
    }

    /** Tải biểu mẫu chính thức từ R2; trả về null nếu R2 chưa có tệp. */
    public Resource loadOfficialResource(String fileName) {
        return officialTemplateStore.find(fileName).orElse(null);
    }


    public String resolveOfficialFileName(ReportTemplateType type, String programCode) {
        String prog = (programCode != null) ? programCode.trim().toUpperCase() : "DEFAULT";
        return switch (type) {
            case FORM_04_RECEPTION_8W -> "04-Phieu_nhan_SV.doc";
            case FORM_04_RECEPTION_12W -> "04-Phieu_nhan_SV_12tuan.doc";
            case M01 -> "M-TT-01-Phieugiaoviec.doc";
            case M02 -> "M-TT-02-Phieutheodoi.doc";
            case M03 -> "M-TT-03-pdgia_coquan.doc";
            case M04, M04_LECTURER_COMMON -> {
                if ("KHMT".equals(prog) || "CS".equals(prog)) yield "M-TT-04-Phieu_danh_gia_danh cho GVHD-2025-KHMT.doc";
                if ("MMT".equals(prog) || "NE".equals(prog)) yield "M-TT-04-Phieu_danh_gia_danh cho GVHD-2025_MMT.doc";
                yield "M-TT-04-Phieu_danh_gia_danh cho GVHD-2025.doc";
            }
            case M04_LECTURER_KHMT -> "M-TT-04-Phieu_danh_gia_danh cho GVHD-2025-KHMT.doc";
            case M04_LECTURER_MMT -> "M-TT-04-Phieu_danh_gia_danh cho GVHD-2025_MMT.doc";
            case M05, M05_REPORT_GUIDELINE, FINAL_REPORT -> "M-TT-05-Maubaocao.doc";
            default -> null;
        };
    }

    public String resolveDefaultFileName(ReportTemplateType type, String programCode) {
        String official = resolveOfficialFileName(type, programCode);
        if (official != null) return official;

        String prog = (programCode != null && !programCode.isBlank()) ? programCode.toUpperCase() : "CHUNG";
        return switch (type) {
            case M01 -> "M-TT-01-Phieugiaoviec.doc";
            case M02 -> "M-TT-02-Phieutheodoi.doc";
            case M03 -> "M-TT-03-pdgia_coquan.doc";
            case M04, M04_LECTURER_KHMT, M04_LECTURER_MMT, M04_LECTURER_COMMON -> "M-TT-04-Phieu_danh_gia_GVHD-" + prog + ".doc";
            case M05, M05_REPORT_GUIDELINE, FINAL_REPORT -> "M-TT-05-Maubaocao.doc";
            case FORM_04_RECEPTION_8W -> "04-Phieu_nhan_SV.doc";
            case FORM_04_RECEPTION_12W -> "04-Phieu_nhan_SV_12tuan.doc";
            default -> "Bieu_mau_thuc_tap_" + type.name() + ".doc";
        };
    }

    public String resolveDefaultTitle(ReportTemplateType type, String programCode) {
        String progDesc = (programCode != null && !programCode.equals("DEFAULT")) ? " - Ngành " + programCode : "";
        return switch (type) {
            case M01 -> "M-TT-01: Phiếu Giao Việc Thực Tập Doanh Nghiệp";
            case M02 -> "M-TT-02: Phiếu Theo Dõi Tiến Độ Thực Tập";
            case M03 -> "M-TT-03: Phiếu Đánh Giá Của Doanh Nghiệp Tiếp Nhận";
            case M04, M04_LECTURER_KHMT, M04_LECTURER_MMT, M04_LECTURER_COMMON -> "M-TT-04: Phiếu Đánh Giá Dành Cho Giảng Viên Hướng Dẫn" + progDesc;
            case M05, M05_REPORT_GUIDELINE, FINAL_REPORT -> "M-TT-05: Mẫu Đề Cương & Báo Cáo Tổng Kết Thực Tập Tốt Nghiệp";
            case FORM_04_RECEPTION_8W -> "Biểu mẫu 04: Phiếu Tiếp Nhận Sinh Viên Thực Tập (8 Tuần)";
            case FORM_04_RECEPTION_12W -> "Biểu mẫu 04: Phiếu Tiếp Nhận Sinh Viên Thực Tập (12 Tuần)";
            default -> "Biểu Mẫu Quy Định Thực Tập - " + type.name();
        };
    }

    private String buildWordHtmlFallback(String title, ReportTemplateType type) {
        return """
            <html xmlns:o='urn:schemas-microsoft-com:office:office'
                  xmlns:w='urn:schemas-microsoft-com:office:word'
                  xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head>
            <body><h2 align="center">%s</h2><p>Trường Công nghệ Thông tin & Truyền thông - Đại học Cần Thơ</p></body></html>
            """.formatted(title);
    }
}
