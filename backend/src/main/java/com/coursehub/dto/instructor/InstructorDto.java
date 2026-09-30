package com.coursehub.dto.instructor;

import com.coursehub.entity.Instructor;
import java.math.BigDecimal;

public record InstructorDto(
        String id,
        String name,
        String headline,
        String avatar,
        String bio,
        BigDecimal rating,
        int studentsCount,
        int coursesCount
) {
    public static InstructorDto fromEntity(Instructor instructor) {
        if (instructor == null) return null;
        return new InstructorDto(
                instructor.getId() != null ? String.valueOf(instructor.getId()) : "inst-1",
                instructor.getName(),
                instructor.getHeadline(),
                instructor.getAvatar(),
                instructor.getBio(),
                instructor.getRating(),
                instructor.getStudentsCount(),
                instructor.getCoursesCount()
        );
    }
}
