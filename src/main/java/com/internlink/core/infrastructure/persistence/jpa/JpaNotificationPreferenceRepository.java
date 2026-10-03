package com.internlink.core.infrastructure.persistence.jpa;
import com.internlink.core.domain.system.NotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
public interface JpaNotificationPreferenceRepository extends JpaRepository<NotificationPreference, UUID> {}
