package com.coursehub.dto.common;

import org.springframework.data.domain.Page;
import java.util.List;

public record PagedResult<T>(
        List<T> items,
        long total,
        int page,
        int totalPages
) {
    public static <T> PagedResult<T> of(Page<T> springPage) {
        return new PagedResult<>(
                springPage.getContent(),
                springPage.getTotalElements(),
                springPage.getNumber() + 1, // 1-indexed to match frontend
                springPage.getTotalPages()
        );
    }

    public static <T> PagedResult<T> of(List<T> items, long total, int page, int totalPages) {
        return new PagedResult<>(items, total, page, totalPages);
    }
}
