package com.coursehub.dto.enrollment;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record UpdateProgressRequest(
        @NotBlank(message = "Lesson ID cannot be blank")
        String lessonId,

        boolean isCompleted,

        @Min(value = 1, message = "Total lessons must be at least 1")
        int totalLessons
) {
}
