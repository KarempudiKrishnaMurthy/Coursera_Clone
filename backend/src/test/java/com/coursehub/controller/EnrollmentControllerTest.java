package com.coursehub.controller;

import com.coursehub.dto.auth.AuthResponse;
import com.coursehub.dto.auth.RegisterRequest;
import com.coursehub.dto.enrollment.UpdateProgressRequest;
import com.coursehub.entity.Enrollment;
import com.coursehub.entity.Role;
import com.coursehub.repository.EnrollmentRepository;
import com.coursehub.repository.RefreshTokenRepository;
import com.coursehub.repository.UserRepository;
import com.coursehub.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class EnrollmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private String token;
    private static final String TEST_EMAIL = "student.enrollment@coursehub.test";

    @BeforeEach
    @Transactional
    void setUp() {
        userRepository.findByEmail(TEST_EMAIL).ifPresent(user -> {
            List<Enrollment> enrollments = enrollmentRepository.findByUserIdWithCourse(user.getId());
            enrollmentRepository.deleteAll(enrollments);
            refreshTokenRepository.deleteByUser(user);
            userRepository.delete(user);
        });

        AuthResponse auth = authService.register(
                new RegisterRequest("Enrollment Student", TEST_EMAIL, "password123", Role.STUDENT)
        );
        this.token = auth.accessToken();
    }

    @Test
    void enrollShouldReturn403WhenUnauthenticated() throws Exception {
        mockMvc.perform(post("/api/v1/enrollments/course-1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    void enrollShouldCreateEnrollmentAndReturn201() throws Exception {
        mockMvc.perform(post("/api/v1/enrollments/course-1")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.courseId").value("course-1"))
                .andExpect(jsonPath("$.progressPercent").value(0))
                .andExpect(jsonPath("$.completedLessonIds").isArray())
                .andExpect(jsonPath("$.lastAccessedAt").exists());
    }

    @Test
    void getMyEnrollmentsShouldReturnEnrolledCourses() throws Exception {
        // First enroll
        mockMvc.perform(post("/api/v1/enrollments/course-1")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated());

        // Then retrieve list
        mockMvc.perform(get("/api/v1/enrollments/my-courses")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].course.id").value("course-1"))
                .andExpect(jsonPath("$[0].progress.courseId").value("course-1"))
                .andExpect(jsonPath("$[0].progress.progressPercent").value(0));
    }

    @Test
    void getCourseProgressShouldReturnCurrentProgress() throws Exception {
        mockMvc.perform(post("/api/v1/enrollments/course-1")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/enrollments/course-1/progress")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.courseId").value("course-1"))
                .andExpect(jsonPath("$.progressPercent").value(0));
    }

    @Test
    void updateProgressShouldCalculatePercentageAndReturnUpdatedState() throws Exception {
        mockMvc.perform(post("/api/v1/enrollments/course-1")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated());

        // Complete 1 lesson out of 5 -> 20%
        UpdateProgressRequest req = new UpdateProgressRequest("les-1-1", true, 5);

        mockMvc.perform(put("/api/v1/enrollments/course-1/progress")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.courseId").value("course-1"))
                .andExpect(jsonPath("$.progressPercent").value(20))
                .andExpect(jsonPath("$.lastAccessedLessonId").value("les-1-1"))
                .andExpect(jsonPath("$.completedLessonIds", hasItem("les-1-1")));
    }
}
