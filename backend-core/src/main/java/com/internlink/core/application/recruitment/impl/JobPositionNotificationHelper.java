package com.internlink.core.application.recruitment.impl;

import com.internlink.core.application.system.NotificationService;
import com.internlink.core.domain.organization.StudentRoster;
import com.internlink.core.domain.recruitment.JobPosition;
import com.internlink.core.infrastructure.persistence.jpa.JpaStudentRosterRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.shared.enums.EligibilityStatus;
import com.internlink.core.shared.enums.JobStatus;
import com.internlink.core.shared.enums.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class JobPositionNotificationHelper {

    private final NotificationService notificationService;
    private final JpaUserRepository userRepository;
    private final JpaStudentRosterRepository studentRosterRepository;

    public void notifyReviewResult(JobPosition job, JobStatus status, String facultyFeedback) {
        if (status == JobStatus.APPROVED) {
            // 1. Thông báo cho người đại diện doanh nghiệp
            var companyReps = userRepository.findByCompanyIdAndRole(job.getCompany().getId(), UserRole.COMPANY_REP);
            for (var rep : companyReps) {
                notificationService.sendNotification(
                    rep.getId(),
                    "JOB_APPROVED",
                    "Tin tuyển dụng đã được duyệt",
                    "Vị trí \"" + job.getTitle() + "\" đã được Ban chủ nhiệm khoa phê duyệt và đăng tuyển.",
                    "/company/jobs"
                );
            }
            // 2. Thông báo cho sinh viên đủ điều kiện trong kỳ thực tập
            List<StudentRoster> rosters = studentRosterRepository.findByTermIdAndEligibilityStatus(job.getTerm().getId(), EligibilityStatus.ELIGIBLE);
            for (var roster : rosters) {
                if (roster.getClaimedUser() != null) {
                    notificationService.sendNotification(
                        roster.getClaimedUser().getId(),
                        "NEW_JOB_POSTED",
                        "Tin tuyển dụng mới: " + job.getTitle(),
                        "Doanh nghiệp " + job.getCompany().getCompanyName() + " vừa đăng tuyển vị trí " + job.getTitle() + ".",
                        "/jobs/" + job.getId()
                    );
                }
            }
        } else if (status == JobStatus.REJECTED) {
            var companyReps = userRepository.findByCompanyIdAndRole(job.getCompany().getId(), UserRole.COMPANY_REP);
            for (var rep : companyReps) {
                notificationService.sendNotification(
                    rep.getId(),
                    "JOB_REJECTED",
                    "Tin tuyển dụng không được duyệt",
                    "Vị trí \"" + job.getTitle() + "\" đã bị từ chối: " + facultyFeedback,
                    "/company/jobs"
                );
            }
        }
    }
}
