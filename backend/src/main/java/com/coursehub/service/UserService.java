package com.coursehub.service;

import com.coursehub.dto.user.UpdateProfileRequest;
import com.coursehub.dto.user.UserDto;
import com.coursehub.entity.User;
import com.coursehub.exception.ResourceNotFoundException;
import com.coursehub.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(String email) {
        User user = getUserByEmail(email);
        return UserDto.fromEntity(user);
    }

    @Transactional
    public UserDto updateProfile(String email, UpdateProfileRequest request) {
        User user = getUserByEmail(email);

        if (request.name() != null && !request.name().isBlank()) {
            user.setName(request.name().trim());
        }
        if (request.headline() != null) {
            user.setHeadline(request.headline().trim());
        }
        if (request.bio() != null) {
            user.setBio(request.bio().trim());
        }
        if (request.avatar() != null && !request.avatar().isBlank()) {
            user.setAvatar(request.avatar().trim());
        }

        User updated = userRepository.save(user);
        return UserDto.fromEntity(updated);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }
}
