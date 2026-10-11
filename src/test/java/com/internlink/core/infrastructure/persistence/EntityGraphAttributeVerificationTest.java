package com.internlink.core.infrastructure.persistence;

import com.internlink.core.domain.placement.InternshipPlacement;
import com.internlink.core.domain.placement.LearningAgreement;
import com.internlink.core.domain.placement.WeeklyLogbook;
import com.internlink.core.domain.recruitment.JobApplication;
import com.internlink.core.domain.recruitment.JobPosition;
import com.internlink.core.infrastructure.persistence.jpa.JpaInternshipPlacementRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaJobApplicationRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaJobPositionRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaLearningAgreementRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaWeeklyLogbookRepository;
import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.repository.EntityGraph;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Đảm nhiệm duy nhất 1 nhiệm vụ: Xác minh tính hợp lệ của tất cả attributePaths trong @EntityGraph
 * bằng Reflection, đảm bảo không có lỗi chính tả dẫn đến lỗi Runtime JPA.
 */
class EntityGraphAttributeVerificationTest {

    private final Map<Class<?>, Class<?>> repositoryToEntityMap = Map.of(
            JpaJobPositionRepository.class, JobPosition.class,
            JpaJobApplicationRepository.class, JobApplication.class,
            JpaInternshipPlacementRepository.class, InternshipPlacement.class,
            JpaLearningAgreementRepository.class, LearningAgreement.class,
            JpaWeeklyLogbookRepository.class, WeeklyLogbook.class
    );

    @Test
    void allDeclaredEntityGraphsMustPointToExistingEntityAttributes() {
        for (Map.Entry<Class<?>, Class<?>> entry : repositoryToEntityMap.entrySet()) {
            Class<?> repoClass = entry.getKey();
            Class<?> entityClass = entry.getValue();

            for (Method method : repoClass.getDeclaredMethods()) {
                EntityGraph entityGraph = method.getAnnotation(EntityGraph.class);
                if (entityGraph != null) {
                    for (String path : entityGraph.attributePaths()) {
                        validatePathExists(repoClass, entityClass, method.getName(), path);
                    }
                }
            }
        }
    }

    private void validatePathExists(Class<?> repoClass, Class<?> rootEntityClass, String methodName, String path) {
        String[] segments = path.split("\\.");
        Class<?> currentClass = rootEntityClass;

        for (String segment : segments) {
            Field field = findField(currentClass, segment);
            assertThat(field)
                    .withFailMessage("Lỗi cấu hình @EntityGraph tại %s#%s: Không tìm thấy trường '%s' trong Entity %s (Path: %s)",
                            repoClass.getSimpleName(), methodName, segment, currentClass.getSimpleName(), path)
                    .isNotNull();

            currentClass = field.getType();
        }
    }

    private Field findField(Class<?> clazz, String fieldName) {
        Class<?> current = clazz;
        while (current != null && current != Object.class) {
            try {
                return current.getDeclaredField(fieldName);
            } catch (NoSuchFieldException ignored) {
                current = current.getSuperclass();
            }
        }
        return null;
    }
}
