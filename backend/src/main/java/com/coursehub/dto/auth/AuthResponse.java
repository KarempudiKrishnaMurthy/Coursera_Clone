package com.coursehub.dto.auth;

import com.coursehub.dto.user.UserDto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        UserDto user
) {
    public static AuthResponse of(String accessToken, String refreshToken, UserDto user) {
        return new AuthResponse(accessToken, refreshToken, "Bearer", user);
    }
}
