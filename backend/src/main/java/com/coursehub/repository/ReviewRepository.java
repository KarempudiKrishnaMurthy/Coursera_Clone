package com.coursehub.repository;

import com.coursehub.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByCourseIdOrderByCreatedAtDesc(String courseId);

    Page<Review> findByCourseId(String courseId, Pageable pageable);
}
