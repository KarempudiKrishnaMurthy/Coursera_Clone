package com.coursehub.controller;

import com.coursehub.dto.common.PagedResult;
import com.coursehub.dto.course.ReviewDto;
import com.coursehub.dto.review.CreateReviewRequest;
import com.coursehub.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/courses/{courseId}/reviews")
@Tag(name = "Reviews", description = "Course feedback and rating endpoints")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    @Operation(summary = "Get reviews for a course", description = "Returns paginated student feedback and star ratings for a specific course")
    public ResponseEntity<PagedResult<ReviewDto>> getCourseReviews(
            @PathVariable String courseId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit
    ) {
        PagedResult<ReviewDto> result = reviewService.getReviewsForCourse(courseId, page, limit);
        return ResponseEntity.ok(result);
    }

    @PostMapping
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Submit a course review", description = "Allows an enrolled learner to rate (1-5 stars) and review a course")
    public ResponseEntity<ReviewDto> createReview(
            @PathVariable String courseId,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateReviewRequest request
    ) {
        ReviewDto created = reviewService.createReview(userDetails.getUsername(), courseId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
