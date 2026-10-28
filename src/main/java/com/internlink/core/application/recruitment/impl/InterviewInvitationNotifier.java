package com.internlink.core.application.recruitment.impl;

import com.internlink.core.application.system.NotificationService;
import com.internlink.core.application.system.notification.*;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.recruitment.JobApplication;
import com.internlink.core.infrastructure.integration.email.EmailProperties;
import com.internlink.core.presentation.recruitment.dto.request.ScheduleInterviewRequest;
import com.internlink.core.shared.enums.InterviewFormat;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.*;

@Component
@RequiredArgsConstructor
public class InterviewInvitationNotifier {
    private final NotificationService notifications;
    private final EmailTemplateService templates;
    private final EmailOutboxService outbox;
    private final EmailProperties settings;

    public void send(
            JobApplication application,
            User actor,
            ScheduleInterviewRequest request,
            int roundNumber,
            String formattedTime,
            String notificationMessage) {
        String jobTitle = application.getJob().getTitle();
        boolean email = !Boolean.FALSE.equals(request.getSendEmail());
        notifications.sendInAppNotification(
                application.getStudent().getId(), "INTERVIEW_SCHEDULED",
                "Mời phỏng vấn: " + jobTitle, notificationMessage, "/student/applications");
        if (!email
                || !settings.isEnabled()
                || "DISABLED".equalsIgnoreCase(settings.getDeliveryMode())) return;

        String companyName = application.getJob().getCompany().getCompanyName();
        String destination = request.getFormat() == InterviewFormat.ONLINE
                ? request.getMeetingUrl() : request.getLocation();
        var values = Map.of(
                "student.fullName", Objects.toString(application.getStudent().getFullName(), ""),
                "company.name", companyName,
                "job.title", jobTitle,
                "interview.scheduledAt", formattedTime,
                "interview.format", request.getFormat().name(),
                "interview.destination", Objects.toString(destination, ""),
                "interview.interviewer", Objects.toString(request.getInterviewer(), ""),
                "interview.notes", Objects.toString(request.getNotes(), ""),
                "actionUrl", settings.getPublicBaseUrl() + "/student/applications");
        var rendered = templates.resolve(request.getEmailTemplateId(), "INTERVIEW_INVITATION", values);
        outbox.enqueueNotice(
                application.getStudent().getEmail(), rendered.subject(), rendered.body(),
                "INTERVIEW_SCHEDULED",
                "interview:" + application.getId() + ":" + roundNumber + ":" + request.getScheduledAt(),
                new EmailDispatchContext(
                        rendered.versionId(), actor.getId(), "JOB_APPLICATION", application.getId(),
                        "COMPANY", application.getJob().getCompany().getId()));
    }
}
