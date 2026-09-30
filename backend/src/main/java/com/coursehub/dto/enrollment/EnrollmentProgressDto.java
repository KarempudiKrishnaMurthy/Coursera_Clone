package com.coursehub.dto.enrollment;

import com.coursehub.entity.Enrollment;
import com.coursehub.entity.LessonCompletion;

import java.util.List;

public record EnrollmentProgressDto(
        String courseId,
        List<String> completedLessonIds,
        String lastAccessedLessonId,
        int progressPercent,
        String lastAccessedAt
) {
    public static EnrollmentProgressDto fromEntity(Enrollment enrollment) {
        List<String> completed = enrollment.getLessonCompletions() != null
                ? enrollment.getLessonCompletions().stream().map(LessonCompletion::getLessonId).toList()
                : List.of();

        return new EnrollmentProgressDto(
                enrollment.getCourse().getId(),
                completed,
                enrollment.getLastAccessedLessonId(),
                enrollment.getProgressPercent(),
                enrollment.getLastAccessedAt() != null ? enrollment.getLastAccessedAt().toString() : "Recent"
        );
    }
}
