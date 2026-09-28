package com.coursehub.dto.course;

import java.math.BigDecimal;
import java.util.List;

public record UpdateCourseRequest(
        String title,
        String subtitle,
        String description,
        String categoryId,
        String level,
        BigDecimal price,
        BigDecimal originalPrice,
        String language,
        String thumbnail,
        String previewVideoUrl,
        Boolean isBestseller,
        Boolean isFeatured,
        List<String> whatYouWillLearn,
        List<String> requirements
) {
}
