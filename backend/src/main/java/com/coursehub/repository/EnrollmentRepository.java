package com.coursehub.repository;

import com.coursehub.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    Optional<Enrollment> findByUserIdAndCourseId(Long userId, String courseId);

    @Query("SELECT e FROM Enrollment e JOIN FETCH e.course WHERE e.user.id = :userId ORDER BY e.lastAccessedAt DESC")
    List<Enrollment> findByUserIdWithCourse(@Param("userId") Long userId);

    boolean existsByUserIdAndCourseId(Long userId, String courseId);
}
