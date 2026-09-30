package com.coursehub.controller;

import com.coursehub.dto.auth.AuthResponse;
import com.coursehub.dto.auth.LoginRequest;
import com.coursehub.dto.auth.RefreshTokenRequest;
import com.coursehub.dto.auth.RegisterRequest;
import com.coursehub.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Endpoints for user registration, authentication, token refresh, and logout")
public class AuthController {

    private final AuthService authService;

    @Value("${app.jwt.cookie-secure:false}")
    private boolean cookieSecure;

    @Value("${app.jwt.refresh-token-expiration-ms:604800000}")
    private long refreshTokenExpirationMs;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Creates a new student or instructor account, issues access token and sets an HttpOnly refresh cookie")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        ResponseCookie cookie = createRefreshTokenCookie(response.refreshToken());

        return ResponseEntity.status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
    }

    @PostMapping("/login")
    @Operation(summary = "Login with credentials", description = "Authenticates user with email/password, issues access token and sets an HttpOnly refresh cookie")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        ResponseCookie cookie = createRefreshTokenCookie(response.refreshToken());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token", description = "Provides a new access token using the HttpOnly refresh cookie or optional request body")
    public ResponseEntity<AuthResponse> refresh(
            @CookieValue(name = "refreshToken", required = false) String cookieRefreshToken,
            @RequestBody(required = false) RefreshTokenRequest request
    ) {
        String tokenToUse = (cookieRefreshToken != null && !cookieRefreshToken.isBlank())
                ? cookieRefreshToken
                : (request != null ? request.refreshToken() : null);

        AuthResponse response = authService.refreshToken(tokenToUse);
        ResponseCookie cookie = createRefreshTokenCookie(response.refreshToken());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user", description = "Invalidates the refresh token in the database and clears the HttpOnly refresh cookie")
    public ResponseEntity<Map<String, String>> logout(
            org.springframework.security.core.Authentication authentication,
            @CookieValue(name = "refreshToken", required = false) String cookieRefreshToken
    ) {
        String email = authentication != null ? authentication.getName() : null;
        authService.logout(email, cookieRefreshToken);

        ResponseCookie clearCookie = clearRefreshTokenCookie();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearCookie.toString())
                .body(Map.of("message", "Logged out successfully"));
    }

    private ResponseCookie createRefreshTokenCookie(String token) {
        return ResponseCookie.from("refreshToken", token)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/api/v1/auth")
                .maxAge(refreshTokenExpirationMs / 1000)
                .sameSite("Lax")
                .build();
    }

    private ResponseCookie clearRefreshTokenCookie() {
        return ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/api/v1/auth")
                .maxAge(0)
                .sameSite("Lax")
                .build();
    }
}
