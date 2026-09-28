package com.coursehub.dto.course;

import com.coursehub.dto.instructor.InstructorDto;
import com.coursehub.entity.Course;

import java.math.BigDecimal;
import java.util.List;

public record CourseDetailDto(
        String id,
        String slug,
        String title,
        String subtitle,
        String description,
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
        String previewVideoUrl,
        InstructorDto instructor,
        boolean isBestseller,
        boolean isFeatured,
        List<String> whatYouWillLearn,
        List<String> requirements,
        List<SectionDto> sections,
        List<ReviewDto> reviews
) {
    public static CourseDetailDto fromEntity(Course course) {
        List<SectionDto> sectionDtos = course.getSections() != null
                ? course.getSections().stream().map(SectionDto::fromEntity).toList()
                : List.of();

        List<ReviewDto> reviewDtos = course.getReviews() != null
                ? course.getReviews().stream().map(ReviewDto::fromEntity).toList()
                : List.of();

        return new CourseDetailDto(
                course.getId(),
                course.getSlug(),
                course.getTitle(),
                course.getSubtitle(),
                course.getDescription(),
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
                course.getPreviewVideoUrl(),
                InstructorDto.fromEntity(course.getInstructor()),
                course.isBestseller(),
                course.isFeatured(),
                course.getWhatYouWillLearn() != null ? course.getWhatYouWillLearn() : List.of(),
                course.getRequirements() != null ? course.getRequirements() : List.of(),
                sectionDtos,
                reviewDtos
        );
    }
}
