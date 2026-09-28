package com.coursehub.controller;

import com.coursehub.dto.auth.LoginRequest;
import com.coursehub.dto.auth.RegisterRequest;
import com.coursehub.entity.Role;
import com.coursehub.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.coursehub.repository.RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    @org.springframework.transaction.annotation.Transactional
    void cleanUp() {
        userRepository.findByEmail("alex@coursehub.test").ifPresent(u -> {
            refreshTokenRepository.deleteByUser(u);
            userRepository.delete(u);
        });
        userRepository.findByEmail("sarah@coursehub.test").ifPresent(u -> {
            refreshTokenRepository.deleteByUser(u);
            userRepository.delete(u);
        });
    }

    @Test
    void registerShouldReturn201WithTokens() throws Exception {
        RegisterRequest request = new RegisterRequest("Alex Rivera", "alex@coursehub.test", "password123", Role.STUDENT);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.email").value("alex@coursehub.test"))
                .andExpect(jsonPath("$.user.name").value("Alex Rivera"));
    }

    @Test
    void registerShouldReturn400WhenValidationFails() throws Exception {
        RegisterRequest invalidRequest = new RegisterRequest("", "not-an-email", "short", Role.STUDENT);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.name").exists())
                .andExpect(jsonPath("$.fieldErrors.email").exists())
                .andExpect(jsonPath("$.fieldErrors.password").exists());
    }

    @Test
    void registerShouldReturn400WhenEmailAlreadyExists() throws Exception {
        RegisterRequest request = new RegisterRequest("Alex Rivera", "alex@coursehub.test", "password123", Role.STUDENT);

        // First registration
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Second registration with duplicate email
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("already exists")));
    }

    @Test
    void loginShouldReturn200WithTokens() throws Exception {
        // First register
        RegisterRequest registerReq = new RegisterRequest("Sarah Connor", "sarah@coursehub.test", "password123", Role.STUDENT);
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated());

        // Then login
        LoginRequest loginReq = new LoginRequest("sarah@coursehub.test", "password123");
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.user.email").value("sarah@coursehub.test"));
    }

    @Test
    void loginShouldReturn401OnWrongPassword() throws Exception {
        RegisterRequest registerReq = new RegisterRequest("Sarah Connor", "sarah@coursehub.test", "password123", Role.STUDENT);
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated());

        LoginRequest wrongLoginReq = new LoginRequest("sarah@coursehub.test", "wrongpassword!");
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongLoginReq)))
                .andExpect(status().isUnauthorized());
    }
}
