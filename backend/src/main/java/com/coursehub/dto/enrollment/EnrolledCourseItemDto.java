package com.coursehub.dto.enrollment;

import com.coursehub.dto.course.CourseSummaryDto;
import com.coursehub.entity.Enrollment;

public record EnrolledCourseItemDto(
        CourseSummaryDto course,
        EnrollmentProgressDto progress
) {
    public static EnrolledCourseItemDto fromEntity(Enrollment enrollment) {
        return new EnrolledCourseItemDto(
                CourseSummaryDto.fromEntity(enrollment.getCourse()),
                EnrollmentProgressDto.fromEntity(enrollment)
        );
    }
}
