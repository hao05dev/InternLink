package com.internlink.core.domain.system;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;
@Entity @Table(name="notification_preferences")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationPreference {
    @Id @Column(name="user_id") private UUID userId;
    @Builder.Default @Column(name="email_enabled", nullable=false) private boolean emailEnabled = true;
    @Builder.Default @Column(name="workflow_email", nullable=false) private boolean workflowEmail = true;
    @Builder.Default @Column(name="reminder_email", nullable=false) private boolean reminderEmail = true;
    @Builder.Default @Column(name="announcement_email", nullable=false) private boolean announcementEmail = false;
    @Builder.Default @Column(name="system_email", nullable=false) private boolean systemEmail = true;
}
