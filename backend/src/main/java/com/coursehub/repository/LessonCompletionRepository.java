package com.coursehub.repository;

import com.coursehub.entity.LessonCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonCompletionRepository extends JpaRepository<LessonCompletion, Long> {

    Optional<LessonCompletion> findByEnrollmentIdAndLessonId(Long enrollmentId, String lessonId);

    List<LessonCompletion> findByEnrollmentId(Long enrollmentId);

    void deleteByEnrollmentIdAndLessonId(Long enrollmentId, String lessonId);
}
