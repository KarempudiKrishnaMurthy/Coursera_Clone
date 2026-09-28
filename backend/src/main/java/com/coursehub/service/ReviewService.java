package com.coursehub.service;

import com.coursehub.dto.common.PagedResult;
import com.coursehub.dto.course.ReviewDto;
import com.coursehub.dto.review.CreateReviewRequest;
import com.coursehub.entity.Course;
import com.coursehub.entity.Review;
import com.coursehub.entity.User;
import com.coursehub.exception.ResourceNotFoundException;
import com.coursehub.repository.CourseRepository;
import com.coursehub.repository.ReviewRepository;
import com.coursehub.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public ReviewService(
            ReviewRepository reviewRepository,
            CourseRepository courseRepository,
            UserRepository userRepository
    ) {
        this.reviewRepository = reviewRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public PagedResult<ReviewDto> getReviewsForCourse(String courseId, int page, int limit) {
        if (!courseRepository.existsById(courseId)) {
            throw new ResourceNotFoundException("Course not found: " + courseId);
        }

        int pageIndex = Math.max(0, page - 1);
        int pageSize = limit > 0 ? limit : 10;
        Pageable pageable = PageRequest.of(pageIndex, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Review> reviewPage = reviewRepository.findByCourseId(courseId, pageable);
        List<ReviewDto> dtos = reviewPage.getContent().stream()
                .map(ReviewDto::fromEntity)
                .toList();

        return PagedResult.of(dtos, reviewPage.getTotalElements(), page, reviewPage.getTotalPages());
    }

    @Transactional
    public ReviewDto createReview(String userEmail, String courseId, CreateReviewRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + courseId));

        Review review = new Review(
                course,
                user,
                user.getName(),
                user.getAvatar(),
                request.rating(),
                request.comment().trim()
        );

        Review savedReview = reviewRepository.save(review);

        // Recalculate course average rating
        List<Review> allReviews = reviewRepository.findByCourseIdOrderByCreatedAtDesc(courseId);
        double avg = allReviews.stream().mapToInt(Review::getRating).average().orElse(request.rating());

        course.setRating(BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP));
        course.setRatingsCount(allReviews.size());
        courseRepository.save(course);

        return ReviewDto.fromEntity(savedReview);
    }
}
