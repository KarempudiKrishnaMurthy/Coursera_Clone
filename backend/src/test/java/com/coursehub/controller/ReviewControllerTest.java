package com.coursehub.controller;

import com.coursehub.dto.auth.AuthResponse;
import com.coursehub.dto.auth.RegisterRequest;
import com.coursehub.dto.review.CreateReviewRequest;
import com.coursehub.entity.Role;
import com.coursehub.repository.RefreshTokenRepository;
import com.coursehub.repository.ReviewRepository;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ReviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private String token;
    private static final String TEST_EMAIL = "reviewer@coursehub.test";

    @BeforeEach
    @Transactional
    void setUp() {
        userRepository.findByEmail(TEST_EMAIL).ifPresent(user -> {
            reviewRepository.deleteAll(reviewRepository.findByCourseIdOrderByCreatedAtDesc("course-1"));
            refreshTokenRepository.deleteByUser(user);
            userRepository.delete(user);
        });

        AuthResponse auth = authService.register(
                new RegisterRequest("Reviewer Jane", TEST_EMAIL, "password123", Role.STUDENT)
        );
        this.token = auth.accessToken();
    }

    @Test
    void getReviewsShouldBePubliclyAccessible() throws Exception {
        mockMvc.perform(get("/api/v1/courses/course-1/reviews")
                        .param("page", "1")
                        .param("limit", "5")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.total").isNumber());
    }

    @Test
    void createReviewShouldReturn403WhenUnauthenticated() throws Exception {
        CreateReviewRequest request = new CreateReviewRequest(5, "Incredible course!");

        mockMvc.perform(post("/api/v1/courses/course-1/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void createReviewShouldSucceedWhenAuthenticated() throws Exception {
        CreateReviewRequest request = new CreateReviewRequest(5, "Incredible course, very comprehensive!");

        mockMvc.perform(post("/api/v1/courses/course-1/reviews")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.userName").value("Reviewer Jane"))
                .andExpect(jsonPath("$.rating").value(5))
                .andExpect(jsonPath("$.comment").value("Incredible course, very comprehensive!"))
                .andExpect(jsonPath("$.date").exists());
    }

    @Test
    void createReviewShouldReturn400WhenRatingIsInvalid() throws Exception {
        CreateReviewRequest request = new CreateReviewRequest(6, "Invalid rating test");

        mockMvc.perform(post("/api/v1/courses/course-1/reviews")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.rating").exists());
    }
}
