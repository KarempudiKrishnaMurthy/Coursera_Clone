package com.coursehub.dto.category;

import com.coursehub.entity.Category;

public record CategoryDto(
        String id,
        String name,
        String icon,
        int count
) {
    public static CategoryDto fromEntity(Category category) {
        return new CategoryDto(
                category.getId(),
                category.getName(),
                category.getIcon(),
                category.getCount()
        );
    }
}
