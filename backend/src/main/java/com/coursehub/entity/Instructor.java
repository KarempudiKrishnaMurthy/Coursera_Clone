package com.coursehub.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "instructors")
public class Instructor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String name;

    private String headline;

    private String avatar;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(precision = 3, scale = 2)
    private BigDecimal rating = BigDecimal.valueOf(5.0);

    @Column(name = "students_count")
    private int studentsCount = 0;

    @Column(name = "courses_count")
    private int coursesCount = 0;

    public Instructor() {
    }

    public Instructor(String name, String headline, String avatar, String bio, BigDecimal rating, int studentsCount, int coursesCount) {
        this.name = name;
        this.headline = headline;
        this.avatar = avatar;
        this.bio = bio;
        this.rating = rating;
        this.studentsCount = studentsCount;
        this.coursesCount = coursesCount;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getHeadline() {
        return headline;
    }

    public void setHeadline(String headline) {
        this.headline = headline;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public BigDecimal getRating() {
        return rating;
    }

    public void setRating(BigDecimal rating) {
        this.rating = rating;
    }

    public int getStudentsCount() {
        return studentsCount;
    }

    public void setStudentsCount(int studentsCount) {
        this.studentsCount = studentsCount;
    }

    public int getCoursesCount() {
        return coursesCount;
    }

    public void setCoursesCount(int coursesCount) {
        this.coursesCount = coursesCount;
    }
}
