package com.coursehub.controller;

import com.coursehub.dto.auth.AuthResponse;
import com.coursehub.dto.auth.LoginRequest;
import com.coursehub.dto.auth.RegisterRequest;
import com.coursehub.dto.user.UserDto;
import com.coursehub.entity.Role;
import com.coursehub.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerUnitTest {

    private MockMvc mockMvc;

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private UserDto testUserDto;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authController, "cookieSecure", false);
        ReflectionTestUtils.setField(authController, "refreshTokenExpirationMs", 604800000L);
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();

        testUserDto = new UserDto(
                1L, "alex@example.com", "Alex Rivera", "avatar.jpg",
                "Engineer", "Bio", Role.STUDENT, List.of()
        );
    }

    @Test
    void loginShouldReturnTokensAndSetHttpOnlyCookie() throws Exception {
        LoginRequest req = new LoginRequest("alex@example.com", "password123");
        AuthResponse authRes = AuthResponse.of("mock-access-token", "mock-refresh-token", testUserDto);

        when(authService.login(any(LoginRequest.class))).thenReturn(authRes);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("mock-access-token"))
                .andExpect(jsonPath("$.user.email").value("alex@example.com"))
                .andExpect(jsonPath("$.user.name").value("Alex Rivera"))
                .andExpect(header().exists(HttpHeaders.SET_COOKIE))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("refreshToken=mock-refresh-token")))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("HttpOnly")))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("Path=/api/v1/auth")));
    }

    @Test
    void registerShouldReturnCreatedAndSetHttpOnlyCookie() throws Exception {
        RegisterRequest req = new RegisterRequest("Alex Rivera", "alex@example.com", "password123", Role.STUDENT);
        AuthResponse authRes = AuthResponse.of("new-access-token", "new-refresh-token", testUserDto);

        when(authService.register(any(RegisterRequest.class))).thenReturn(authRes);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").value("new-access-token"))
                .andExpect(header().exists(HttpHeaders.SET_COOKIE))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("refreshToken=new-refresh-token")))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("HttpOnly")));
    }

    @Test
    void refreshWithCookieShouldReturnNewAccessToken() throws Exception {
        AuthResponse authRes = AuthResponse.of("refreshed-access-token", "retained-refresh-token", testUserDto);
        when(authService.refreshToken("cookie-refresh-token")).thenReturn(authRes);

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .cookie(new Cookie("refreshToken", "cookie-refresh-token"))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("refreshed-access-token"))
                .andExpect(header().exists(HttpHeaders.SET_COOKIE));
    }

    @Test
    void logoutShouldClearHttpOnlyCookieAndInvalidateToken() throws Exception {
        TestingAuthenticationToken auth = new TestingAuthenticationToken("alex@example.com", null);

        mockMvc.perform(post("/api/v1/auth/logout")
                        .principal(auth)
                        .cookie(new Cookie("refreshToken", "active-refresh-token"))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logged out successfully"))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("refreshToken=")))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("Max-Age=0")));

        verify(authService).logout("alex@example.com", "active-refresh-token");
    }
}
