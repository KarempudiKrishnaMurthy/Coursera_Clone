package com.coursehub.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "course_sections")
public class CourseSection {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    private String title;

    @Column(name = "sort_order")
    private int sortOrder = 0;

    @OneToMany(mappedBy = "section", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<SectionLesson> lessons = new ArrayList<>();

    public CourseSection() {
    }

    public CourseSection(String id, String title, int sortOrder) {
        this.id = id;
        this.title = title;
        this.sortOrder = sortOrder;
    }

    public void addLesson(SectionLesson lesson) {
        lessons.add(lesson);
        lesson.setSection(this);
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(int sortOrder) {
        this.sortOrder = sortOrder;
    }

    public List<SectionLesson> getLessons() {
        return lessons;
    }

    public void setLessons(List<SectionLesson> lessons) {
        this.lessons = lessons;
    }
}
