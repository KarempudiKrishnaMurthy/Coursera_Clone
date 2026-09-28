package com.coursehub.service;

import com.coursehub.dto.auth.AuthResponse;
import com.coursehub.dto.auth.LoginRequest;
import com.coursehub.dto.auth.RefreshTokenRequest;
import com.coursehub.dto.auth.RegisterRequest;
import com.coursehub.dto.user.UserDto;
import com.coursehub.entity.RefreshToken;
import com.coursehub.entity.Role;
import com.coursehub.entity.User;
import com.coursehub.exception.BadRequestException;
import com.coursehub.exception.UnauthorizedException;
import com.coursehub.repository.RefreshTokenRepository;
import com.coursehub.repository.UserRepository;
import com.coursehub.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    @Value("${app.jwt.refresh-token-expiration-ms:604800000}")
    private long refreshTokenExpirationMs;

    public AuthService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager,
            UserDetailsService userDetailsService
    ) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email().toLowerCase().trim())) {
            throw new BadRequestException("An account with this email already exists");
        }

        User user = new User(
                request.email().toLowerCase().trim(),
                passwordEncoder.encode(request.password()),
                request.name().trim(),
                request.role() != null ? request.role() : Role.STUDENT
        );
        user.setAvatar("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80");
        user.setHeadline("New CourseHub Learner");

        User savedUser = userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(savedUser.getEmail());
        String accessToken = jwtService.generateAccessToken(userDetails, Map.of(
                "userId", savedUser.getId(),
                "role", savedUser.getRole().name()
        ));

        String refreshToken = createOrUpdateRefreshToken(savedUser);

        return AuthResponse.of(accessToken, refreshToken, UserDto.fromEntity(savedUser));
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.email().toLowerCase().trim(),
                            request.password()
                    )
            );
        } catch (BadCredentialsException e) {
            throw new UnauthorizedException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.email().toLowerCase().trim())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = jwtService.generateAccessToken(userDetails, Map.of(
                "userId", user.getId(),
                "role", user.getRole().name()
        ));

        String refreshToken = createOrUpdateRefreshToken(user);

        return AuthResponse.of(accessToken, refreshToken, UserDto.fromEntity(user));
    }

    @Transactional
    public AuthResponse refreshToken(String refreshTokenString) {
        if (refreshTokenString == null || refreshTokenString.isBlank()) {
            throw new BadRequestException("Refresh token is required");
        }

        RefreshToken token = refreshTokenRepository.findByToken(refreshTokenString.trim())
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token);
            throw new UnauthorizedException("Refresh token has expired. Please log in again.");
        }

        User user = token.getUser();
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String newAccessToken = jwtService.generateAccessToken(userDetails, Map.of(
                "userId", user.getId(),
                "role", user.getRole().name()
        ));

        // Refresh token sliding window / update expiry
        token.setExpiryDate(Instant.now().plusMillis(refreshTokenExpirationMs));
        refreshTokenRepository.save(token);

        return AuthResponse.of(newAccessToken, token.getToken(), UserDto.fromEntity(user));
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        return refreshToken(request != null ? request.refreshToken() : null);
    }

    @Transactional
    public void logout(String email, String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            refreshTokenRepository.deleteByToken(refreshToken.trim());
        }
        if (email != null && !email.isBlank()) {
            userRepository.findByEmail(email.toLowerCase().trim()).ifPresent(refreshTokenRepository::deleteByUser);
        }
    }

    @Transactional
    public void logout(String email) {
        logout(email, null);
    }

    private String createOrUpdateRefreshToken(User user) {
        Instant expiry = Instant.now().plusMillis(refreshTokenExpirationMs);
        String tokenString = UUID.randomUUID().toString();

        RefreshToken refreshToken = refreshTokenRepository.findByUser(user)
                .map(existing -> {
                    existing.setToken(tokenString);
                    existing.setExpiryDate(expiry);
                    return existing;
                })
                .orElseGet(() -> new RefreshToken(user, tokenString, expiry));

        refreshTokenRepository.save(refreshToken);
        return tokenString;
    }
}
