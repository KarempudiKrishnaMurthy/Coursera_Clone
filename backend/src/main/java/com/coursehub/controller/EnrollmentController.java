package com.coursehub.controller;

import com.coursehub.dto.enrollment.EnrolledCourseItemDto;
import com.coursehub.dto.enrollment.EnrollmentProgressDto;
import com.coursehub.dto.enrollment.UpdateProgressRequest;
import com.coursehub.service.EnrollmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/enrollments")
@Tag(name = "Enrollments", description = "Course enrollment, curriculum progress tracking, and dashboard inventory endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @PostMapping("/{courseId}")
    @Operation(summary = "Enroll in a course", description = "Enrolls the authenticated user into a specified course")
    public ResponseEntity<EnrollmentProgressDto> enroll(
            @PathVariable String courseId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        EnrollmentProgressDto result = enrollmentService.enroll(userDetails.getUsername(), courseId);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @GetMapping("/my-courses")
    @Operation(summary = "Get user's enrolled courses", description = "Returns all courses the authenticated student has enrolled in along with their progress percentage")
    public ResponseEntity<List<EnrolledCourseItemDto>> getMyEnrollments(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<EnrolledCourseItemDto> items = enrollmentService.getMyEnrollments(userDetails.getUsername());
        return ResponseEntity.ok(items);
    }

    @GetMapping("/{courseId}/progress")
    @Operation(summary = "Get course progress", description = "Returns progress percentage, completed lessons, and last accessed timestamp for a specific course")
    public ResponseEntity<EnrollmentProgressDto> getCourseProgress(
            @PathVariable String courseId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        EnrollmentProgressDto progress = enrollmentService.getCourseProgress(userDetails.getUsername(), courseId);
        return ResponseEntity.ok(progress);
    }

    @PutMapping("/{courseId}/progress")
    @Operation(summary = "Update lesson completion", description = "Marks a lesson as completed or incomplete and updates the overall course progress percentage")
    public ResponseEntity<EnrollmentProgressDto> updateProgress(
            @PathVariable String courseId,
            @Valid @RequestBody UpdateProgressRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        EnrollmentProgressDto updated = enrollmentService.updateLessonCompletion(
                userDetails.getUsername(), courseId, request
        );
        return ResponseEntity.ok(updated);
    }
}
