package com.coursehub.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "enrollments", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "course_id"})
})
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "progress_percent")
    private int progressPercent = 0;

    @Column(name = "last_accessed_lesson_id")
    private String lastAccessedLessonId;

    @Column(name = "last_accessed_at")
    private Instant lastAccessedAt = Instant.now();

    @Column(name = "enrolled_at", updatable = false)
    private Instant enrolledAt = Instant.now();

    @OneToMany(mappedBy = "enrollment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LessonCompletion> lessonCompletions = new ArrayList<>();

    public Enrollment() {
    }

    public Enrollment(User user, Course course) {
        this.user = user;
        this.course = course;
        this.progressPercent = 0;
        this.enrolledAt = Instant.now();
        this.lastAccessedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public int getProgressPercent() {
        return progressPercent;
    }

    public void setProgressPercent(int progressPercent) {
        this.progressPercent = progressPercent;
    }

    public String getLastAccessedLessonId() {
        return lastAccessedLessonId;
    }

    public void setLastAccessedLessonId(String lastAccessedLessonId) {
        this.lastAccessedLessonId = lastAccessedLessonId;
    }

    public Instant getLastAccessedAt() {
        return lastAccessedAt;
    }

    public void setLastAccessedAt(Instant lastAccessedAt) {
        this.lastAccessedAt = lastAccessedAt;
    }

    public Instant getEnrolledAt() {
        return enrolledAt;
    }

    public void setEnrolledAt(Instant enrolledAt) {
        this.enrolledAt = enrolledAt;
    }

    public List<LessonCompletion> getLessonCompletions() {
        return lessonCompletions;
    }

    public void setLessonCompletions(List<LessonCompletion> lessonCompletions) {
        this.lessonCompletions = lessonCompletions;
    }
}
