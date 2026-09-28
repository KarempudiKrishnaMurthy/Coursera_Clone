package com.coursehub.dto.course;

import com.coursehub.entity.Review;

public record ReviewDto(
        Long id,
        String userName,
        String userAvatar,
        int rating,
        String date,
        String comment
) {
    public static ReviewDto fromEntity(Review review) {
        return new ReviewDto(
                review.getId(),
                review.getUserName(),
                review.getUserAvatar(),
                review.getRating(),
                review.getCreatedAt() != null ? review.getCreatedAt().toString() : "Recent",
                review.getComment()
        );
    }
}
