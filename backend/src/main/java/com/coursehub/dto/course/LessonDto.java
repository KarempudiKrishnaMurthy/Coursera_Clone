package com.coursehub.dto.course;

import com.coursehub.entity.SectionLesson;

public record LessonDto(
        String id,
        String title,
        String duration,
        String videoUrl,
        boolean isFreePreview
) {
    public static LessonDto fromEntity(SectionLesson lesson) {
        return new LessonDto(
                lesson.getId(),
                lesson.getTitle(),
                lesson.getDuration(),
                lesson.getVideoUrl(),
                lesson.isFreePreview()
        );
    }
}
