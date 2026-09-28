package com.coursehub.service;

import com.coursehub.dto.auth.AuthResponse;
import com.coursehub.dto.auth.LoginRequest;
import com.coursehub.dto.auth.RefreshTokenRequest;
import com.coursehub.dto.auth.RegisterRequest;
import com.coursehub.entity.RefreshToken;
import com.coursehub.entity.Role;
import com.coursehub.entity.User;
import com.coursehub.exception.BadRequestException;
import com.coursehub.exception.UnauthorizedException;
import com.coursehub.repository.RefreshTokenRepository;
import com.coursehub.repository.UserRepository;
import com.coursehub.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserDetailsService userDetailsService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository,
                refreshTokenRepository,
                passwordEncoder,
                jwtService,
                authenticationManager,
                userDetailsService
        );
    }

    @Test
    void registerShouldSucceedWhenEmailIsUnique() {
        RegisterRequest request = new RegisterRequest("Jane Doe", "jane@example.com", "password123", Role.STUDENT);

        when(userRepository.existsByEmail("jane@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");

        User savedUser = new User("jane@example.com", "encodedPassword", "Jane Doe", Role.STUDENT);
        savedUser.setId(1L);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        UserDetails userDetails = mock(UserDetails.class);
        when(userDetailsService.loadUserByUsername("jane@example.com")).thenReturn(userDetails);
        when(jwtService.generateAccessToken(eq(userDetails), any())).thenReturn("mockJwtToken");

        when(refreshTokenRepository.findByUser(any(User.class))).thenReturn(Optional.empty());

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mockJwtToken", response.accessToken());
        assertEquals("Bearer", response.tokenType());
        assertEquals("jane@example.com", response.user().email());
        assertEquals("Jane Doe", response.user().name());

        verify(userRepository).save(any(User.class));
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void registerShouldThrowBadRequestWhenEmailAlreadyExists() {
        RegisterRequest request = new RegisterRequest("Jane Doe", "jane@example.com", "password123", Role.STUDENT);
        when(userRepository.existsByEmail("jane@example.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void loginShouldSucceedWithValidCredentials() {
        LoginRequest request = new LoginRequest("jane@example.com", "password123");

        User user = new User("jane@example.com", "encodedPassword", "Jane Doe", Role.STUDENT);
        user.setId(1L);
        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(user));

        UserDetails userDetails = mock(UserDetails.class);
        when(userDetailsService.loadUserByUsername("jane@example.com")).thenReturn(userDetails);
        when(jwtService.generateAccessToken(eq(userDetails), any())).thenReturn("mockJwtToken");

        when(refreshTokenRepository.findByUser(user)).thenReturn(Optional.empty());

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mockJwtToken", response.accessToken());
        assertEquals("jane@example.com", response.user().email());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void loginShouldThrowUnauthorizedOnBadCredentials() {
        LoginRequest request = new LoginRequest("jane@example.com", "wrongpassword");

        doThrow(new BadCredentialsException("Bad credentials"))
                .when(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));

        assertThrows(UnauthorizedException.class, () -> authService.login(request));
    }

    @Test
    void refreshTokenShouldThrowUnauthorizedWhenExpired() {
        RefreshToken token = new RefreshToken(
                new User("jane@example.com", "pass", "Jane", Role.STUDENT),
                "expired-token",
                Instant.now().minus(1, ChronoUnit.HOURS)
        );

        when(refreshTokenRepository.findByToken("expired-token")).thenReturn(Optional.of(token));

        assertThrows(UnauthorizedException.class,
                () -> authService.refreshToken(new RefreshTokenRequest("expired-token")));

        verify(refreshTokenRepository).delete(token);
    }

    @Test
    void refreshTokenShouldSucceedWhenValid() {
        User user = new User("jane@example.com", "pass", "Jane", Role.STUDENT);
        user.setId(1L);
        RefreshToken token = new RefreshToken(
                user,
                "valid-refresh-token",
                Instant.now().plus(1, ChronoUnit.DAYS)
        );

        when(refreshTokenRepository.findByToken("valid-refresh-token")).thenReturn(Optional.of(token));

        UserDetails userDetails = mock(UserDetails.class);
        when(userDetailsService.loadUserByUsername("jane@example.com")).thenReturn(userDetails);
        when(jwtService.generateAccessToken(eq(userDetails), any())).thenReturn("new-access-token");

        AuthResponse response = authService.refreshToken("valid-refresh-token");

        assertNotNull(response);
        assertEquals("new-access-token", response.accessToken());
        assertEquals("valid-refresh-token", response.refreshToken());
        verify(refreshTokenRepository).save(token);
    }

    @Test
    void logoutShouldDeleteByTokenAndUser() {
        User user = new User("jane@example.com", "pass", "Jane", Role.STUDENT);
        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(user));

        authService.logout("jane@example.com", "some-refresh-token");

        verify(refreshTokenRepository).deleteByToken("some-refresh-token");
        verify(refreshTokenRepository).deleteByUser(user);
    }
}
