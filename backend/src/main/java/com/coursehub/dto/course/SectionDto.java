package com.coursehub.dto.course;

import com.coursehub.entity.CourseSection;
import java.util.List;

public record SectionDto(
        String id,
        String title,
        List<LessonDto> lessons
) {
    public static SectionDto fromEntity(CourseSection section) {
        List<LessonDto> lessonDtos = section.getLessons() != null
                ? section.getLessons().stream().map(LessonDto::fromEntity).toList()
                : List.of();
        return new SectionDto(section.getId(), section.getTitle(), lessonDtos);
    }
}
