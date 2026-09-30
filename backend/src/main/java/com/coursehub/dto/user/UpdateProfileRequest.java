package com.coursehub.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @NotBlank(message = "Name cannot be blank")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        String name,

        @Size(max = 255, message = "Headline cannot exceed 255 characters")
        String headline,

        @Size(max = 2000, message = "Bio cannot exceed 2000 characters")
        String bio,

        String avatar
) {
}
