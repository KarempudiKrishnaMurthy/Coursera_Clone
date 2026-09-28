package com.coursehub.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "lessons")
public class SectionLesson {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    private CourseSection section;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String duration;

    @Column(name = "video_url")
    private String videoUrl;

    @Column(name = "is_free_preview")
    private boolean isFreePreview = false;

    @Column(name = "sort_order")
    private int sortOrder = 0;

    public SectionLesson() {
    }

    public SectionLesson(String id, String title, String duration, boolean isFreePreview, int sortOrder) {
        this.id = id;
        this.title = title;
        this.duration = duration;
        this.isFreePreview = isFreePreview;
        this.sortOrder = sortOrder;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public CourseSection getSection() {
        return section;
    }

    public void setSection(CourseSection section) {
        this.section = section;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }

    public boolean isFreePreview() {
        return isFreePreview;
    }

    public void setFreePreview(boolean freePreview) {
        isFreePreview = freePreview;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(int sortOrder) {
        this.sortOrder = sortOrder;
    }
}
