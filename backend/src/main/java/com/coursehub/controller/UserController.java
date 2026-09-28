package com.coursehub.controller;

import com.coursehub.dto.user.UpdateProfileRequest;
import com.coursehub.dto.user.UserDto;
import com.coursehub.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Users", description = "Endpoints for user profile retrieval and management")
@SecurityRequirement(name = "Bearer Authentication")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user profile", description = "Returns profile details for the authenticated user")
    public ResponseEntity<UserDto> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        UserDto userDto = userService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(userDto);
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user profile", description = "Updates headline, biography, name, or avatar of the authenticated user")
    public ResponseEntity<UserDto> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        UserDto updated = userService.updateProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(updated);
    }
}
