package com.coursehub.dto.course;

import com.coursehub.dto.instructor.InstructorDto;
import com.coursehub.entity.Course;

import java.math.BigDecimal;

public record CourseSummaryDto(
        String id,
        String slug,
        String title,
        String subtitle,
        String category,
        String level,
        BigDecimal price,
        BigDecimal originalPrice,
        BigDecimal rating,
        int ratingsCount,
        int studentsCount,
        String language,
        String lastUpdated,
        String thumbnail,
        InstructorDto instructor,
        boolean isBestseller,
        boolean isFeatured
) {
    public static CourseSummaryDto fromEntity(Course course) {
        return new CourseSummaryDto(
                course.getId(),
                course.getSlug(),
                course.getTitle(),
                course.getSubtitle(),
                course.getCategory() != null ? course.getCategory().getId() : "web-dev",
                course.getLevel(),
                course.getPrice(),
                course.getOriginalPrice(),
                course.getRating(),
                course.getRatingsCount(),
                course.getStudentsCount(),
                course.getLanguage(),
                course.getLastUpdated(),
                course.getThumbnail(),
                InstructorDto.fromEntity(course.getInstructor()),
                course.isBestseller(),
                course.isFeatured()
        );
    }
}
