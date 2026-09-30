package com.coursehub.controller;

import com.coursehub.dto.common.PagedResult;
import com.coursehub.dto.course.CourseDetailDto;
import com.coursehub.dto.course.CourseSummaryDto;
import com.coursehub.dto.course.CreateCourseRequest;
import com.coursehub.dto.course.UpdateCourseRequest;
import com.coursehub.entity.User;
import com.coursehub.service.CourseService;
import com.coursehub.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/courses")
@Tag(name = "Courses", description = "Course catalog, discovery, filtering, and management endpoints")
public class CourseController {

    private final CourseService courseService;
    private final UserService userService;

    public CourseController(CourseService courseService, UserService userService) {
        this.courseService = courseService;
        this.userService = userService;
    }

    @GetMapping
    @Operation(summary = "List courses with filters & pagination", description = "Filter by search text, category, skill level, price (free/paid), and minimum rating")
    public ResponseEntity<PagedResult<CourseSummaryDto>> getCourses(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String price,
            @RequestParam(required = false) Double rating,
            @RequestParam(defaultValue = "popular") String sortBy,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "9") int limit
    ) {
        PagedResult<CourseSummaryDto> result = courseService.getCourses(
                search, category, level, price, rating, sortBy, page, limit
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/popular")
    @Operation(summary = "Get featured popular courses", description = "Returns top 4 courses by student enrollment count")
    public ResponseEntity<List<CourseSummaryDto>> getPopularCourses() {
        return ResponseEntity.ok(courseService.getPopularCourses());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get course by ID", description = "Returns full curriculum, instructor details, and reviews")
    public ResponseEntity<CourseDetailDto> getCourseById(@PathVariable String id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get course by slug", description = "Returns full course details matching human-readable URL slug")
    public ResponseEntity<CourseDetailDto> getCourseBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(courseService.getCourseBySlug(slug));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Create a course", description = "Allows instructors or admins to publish a new course")
    public ResponseEntity<CourseDetailDto> createCourse(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateCourseRequest request
    ) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        CourseDetailDto created = courseService.createCourse(request, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Update course details", description = "Updates an existing course")
    public ResponseEntity<CourseDetailDto> updateCourse(
            @PathVariable String id,
            @Valid @RequestBody UpdateCourseRequest request
    ) {
        CourseDetailDto updated = courseService.updateCourse(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Delete course", description = "Permanently deletes a course")
    public ResponseEntity<Map<String, String>> deleteCourse(@PathVariable String id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok(Map.of("message", "Course deleted successfully"));
    }
}
