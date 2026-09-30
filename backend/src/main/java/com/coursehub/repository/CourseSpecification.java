package com.coursehub.repository;

import com.coursehub.entity.Course;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class CourseSpecification {

    public static Specification<Course> withFilters(
            String search,
            String category,
            String level,
            String price,
            Double minRating
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Search Query in title, subtitle, or description
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase().trim() + "%";
                Predicate titleMatch = cb.like(cb.lower(root.get("title")), pattern);
                Predicate subtitleMatch = cb.like(cb.lower(root.get("subtitle")), pattern);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), pattern);
                predicates.add(cb.or(titleMatch, subtitleMatch, descMatch));
            }

            // 2. Category
            if (category != null && !category.isBlank() && !category.equalsIgnoreCase("all")) {
                predicates.add(cb.equal(root.get("category").get("id"), category));
            }

            // 3. Skill Level
            if (level != null && !level.isBlank() && !level.equalsIgnoreCase("all")) {
                Predicate exactLevel = cb.equal(root.get("level"), level);
                Predicate allLevel = cb.equal(root.get("level"), "all");
                predicates.add(cb.or(exactLevel, allLevel));
            }

            // 4. Price (free vs paid)
            if (price != null && !price.isBlank() && !price.equalsIgnoreCase("all")) {
                if (price.equalsIgnoreCase("free")) {
                    predicates.add(cb.equal(root.get("price"), BigDecimal.ZERO));
                } else if (price.equalsIgnoreCase("paid")) {
                    predicates.add(cb.greaterThan(root.get("price"), BigDecimal.ZERO));
                }
            }

            // 5. Minimum Rating
            if (minRating != null && minRating > 0) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("rating"), BigDecimal.valueOf(minRating)));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
