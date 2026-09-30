package com.coursehub.dto.course;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public record CreateCourseRequest(
        @NotBlank(message = "Title is required")
        @Size(min = 5, max = 255, message = "Title must be between 5 and 255 characters")
        String title,

        @NotBlank(message = "Subtitle is required")
        String subtitle,

        @NotBlank(message = "Description is required")
        String description,

        @NotBlank(message = "Category ID is required")
        String categoryId,

        @NotBlank(message = "Level is required")
        String level,

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.0", inclusive = true, message = "Price cannot be negative")
        BigDecimal price,

        BigDecimal originalPrice,

        String language,

        String thumbnail,

        String previewVideoUrl,

        List<String> whatYouWillLearn,

        List<String> requirements
) {
}
