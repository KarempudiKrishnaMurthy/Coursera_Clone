package com.coursehub.service;

import com.coursehub.dto.enrollment.EnrolledCourseItemDto;
import com.coursehub.dto.enrollment.EnrollmentProgressDto;
import com.coursehub.dto.enrollment.UpdateProgressRequest;
import com.coursehub.entity.*;
import com.coursehub.exception.ResourceNotFoundException;
import com.coursehub.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final LessonCompletionRepository lessonCompletionRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final InstructorRepository instructorRepository;

    public EnrollmentService(
            EnrollmentRepository enrollmentRepository,
            LessonCompletionRepository lessonCompletionRepository,
            CourseRepository courseRepository,
            UserRepository userRepository,
            InstructorRepository instructorRepository
    ) {
        this.enrollmentRepository = enrollmentRepository;
        this.lessonCompletionRepository = lessonCompletionRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.instructorRepository = instructorRepository;
    }

    @Transactional
    public EnrollmentProgressDto enroll(String userEmail, String courseId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + courseId));

        Optional<Enrollment> existing = enrollmentRepository.findByUserIdAndCourseId(user.getId(), courseId);
        if (existing.isPresent()) {
            return EnrollmentProgressDto.fromEntity(existing.get());
        }

        Enrollment enrollment = new Enrollment(user, course);
        Enrollment saved = enrollmentRepository.save(enrollment);

        // Update user enrolled course IDs cache
        if (!user.getEnrolledCourseIds().contains(courseId)) {
            user.getEnrolledCourseIds().add(courseId);
            userRepository.save(user);
        }

        // Increment student counts
        course.setStudentsCount(course.getStudentsCount() + 1);
        courseRepository.save(course);

        if (course.getInstructor() != null) {
            Instructor instructor = course.getInstructor();
            instructor.setStudentsCount(instructor.getStudentsCount() + 1);
            instructorRepository.save(instructor);
        }

        return EnrollmentProgressDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<EnrolledCourseItemDto> getMyEnrollments(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        List<Enrollment> enrollments = enrollmentRepository.findByUserIdWithCourse(user.getId());
        return enrollments.stream()
                .map(EnrolledCourseItemDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public EnrollmentProgressDto getCourseProgress(String userEmail, String courseId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(user.getId(), courseId)
                .orElseThrow(() -> new ResourceNotFoundException("No active enrollment found for course: " + courseId));

        return EnrollmentProgressDto.fromEntity(enrollment);
    }

    @Transactional
    public EnrollmentProgressDto updateLessonCompletion(
            String userEmail,
            String courseId,
            UpdateProgressRequest request
    ) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(user.getId(), courseId)
                .orElseThrow(() -> new ResourceNotFoundException("No active enrollment found for course: " + courseId));

        Optional<LessonCompletion> existingCompletion =
                lessonCompletionRepository.findByEnrollmentIdAndLessonId(enrollment.getId(), request.lessonId());

        if (request.isCompleted() && existingCompletion.isEmpty()) {
            LessonCompletion completion = new LessonCompletion(enrollment, request.lessonId());
            lessonCompletionRepository.save(completion);
            enrollment.getLessonCompletions().add(completion);
        } else if (!request.isCompleted() && existingCompletion.isPresent()) {
            lessonCompletionRepository.delete(existingCompletion.get());
            enrollment.getLessonCompletions().remove(existingCompletion.get());
        }

        int completedCount = enrollment.getLessonCompletions().size();
        int percent = request.totalLessons() > 0
                ? (int) Math.round(((double) completedCount / request.totalLessons()) * 100)
                : 0;

        enrollment.setProgressPercent(Math.min(100, Math.max(0, percent)));
        enrollment.setLastAccessedLessonId(request.lessonId());
        enrollment.setLastAccessedAt(Instant.now());

        Enrollment updated = enrollmentRepository.save(enrollment);
        return EnrollmentProgressDto.fromEntity(updated);
    }
}
