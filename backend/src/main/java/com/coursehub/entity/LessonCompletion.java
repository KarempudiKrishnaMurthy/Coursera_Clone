package com.coursehub.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "enrollment_progress", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"enrollment_id", "lesson_id"})
})
public class LessonCompletion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", nullable = false)
    private Enrollment enrollment;

    @Column(name = "lesson_id", nullable = false)
    private String lessonId;

    @Column(name = "completed_at")
    private Instant completedAt = Instant.now();

    public LessonCompletion() {
    }

    public LessonCompletion(Enrollment enrollment, String lessonId) {
        this.enrollment = enrollment;
        this.lessonId = lessonId;
        this.completedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Enrollment getEnrollment() {
        return enrollment;
    }

    public void setEnrollment(Enrollment enrollment) {
        this.enrollment = enrollment;
    }

    public String getLessonId() {
        return lessonId;
    }

    public void setLessonId(String lessonId) {
        this.lessonId = lessonId;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }
}
