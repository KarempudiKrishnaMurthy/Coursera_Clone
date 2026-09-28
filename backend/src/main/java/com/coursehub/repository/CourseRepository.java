package com.coursehub.repository;

import com.coursehub.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, String>, JpaSpecificationExecutor<Course> {

    Optional<Course> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<Course> findTop4ByOrderByStudentsCountDesc();

    List<Course> findByInstructorId(Long instructorId);
}
