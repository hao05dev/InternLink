package com.internlink.core.domain.organization;

import com.internlink.core.domain.auth.User;
import com.internlink.core.shared.domain.BaseEntity;
import com.internlink.core.shared.enums.ReportTemplateType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "report_template_versions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportTemplateVersion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "term_id", nullable = false)
    private InternshipTerm term;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "report_type", nullable = false, length = 50)
    private ReportTemplateType reportType;

    @Column(name = "file_url", nullable = false, length = 500)
    private String fileUrl;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Builder.Default
    @Column(name = "file_size_bytes", nullable = false)
    private Long fileSizeBytes = 0L;

    @Builder.Default
    @Column(name = "mime_type", nullable = false, length = 100)
    private String mimeType = "application/octet-stream";

    @Builder.Default
    @Column(name = "version_number", nullable = false)
    private Integer versionNumber = 1;

    @Builder.Default
    @Column(name = "is_mandatory", nullable = false)
    private Boolean isMandatory = true;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;
}
