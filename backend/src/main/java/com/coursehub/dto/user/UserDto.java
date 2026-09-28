package com.coursehub.dto.user;

import com.coursehub.entity.Role;
import com.coursehub.entity.User;

import java.util.List;

public record UserDto(
        Long id,
        String email,
        String name,
        String headline,
        String bio,
        String avatar,
        Role role,
        List<String> enrolledCourseIds
) {
    public static UserDto fromEntity(User user) {
        return new UserDto(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getHeadline(),
                user.getBio(),
                user.getAvatar(),
                user.getRole(),
                user.getEnrolledCourseIds()
        );
    }
}
