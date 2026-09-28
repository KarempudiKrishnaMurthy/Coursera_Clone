package com.coursehub.service;

import com.coursehub.dto.common.PagedResult;
import com.coursehub.dto.course.CourseDetailDto;
import com.coursehub.dto.course.CourseSummaryDto;
import com.coursehub.dto.course.CreateCourseRequest;
import com.coursehub.dto.course.UpdateCourseRequest;
import com.coursehub.entity.Category;
import com.coursehub.entity.Course;
import com.coursehub.entity.Instructor;
import com.coursehub.exception.BadRequestException;
import com.coursehub.exception.ResourceNotFoundException;
import com.coursehub.repository.CategoryRepository;
import com.coursehub.repository.CourseRepository;
import com.coursehub.repository.CourseSpecification;
import com.coursehub.repository.InstructorRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;
    private final InstructorRepository instructorRepository;

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    public CourseService(
            CourseRepository courseRepository,
            CategoryRepository categoryRepository,
            InstructorRepository instructorRepository
    ) {
        this.courseRepository = courseRepository;
        this.categoryRepository = categoryRepository;
        this.instructorRepository = instructorRepository;
    }

    @Transactional(readOnly = true)
    public PagedResult<CourseSummaryDto> getCourses(
            String search,
            String category,
            String level,
            String price,
            Double minRating,
            String sortBy,
            int page,
            int limit
    ) {
        Sort sort = switch (sortBy != null ? sortBy.toLowerCase() : "popular") {
            case "highest-rated" -> Sort.by(Sort.Direction.DESC, "rating");
            case "newest" -> Sort.by(Sort.Direction.DESC, "createdAt");
            case "price-low" -> Sort.by(Sort.Direction.ASC, "price");
            case "price-high" -> Sort.by(Sort.Direction.DESC, "price");
            case "popular" -> Sort.by(Sort.Direction.DESC, "studentsCount");
            default -> Sort.by(Sort.Direction.DESC, "studentsCount");
        };

        int pageIndex = Math.max(0, page - 1);
        int pageSize = limit > 0 ? limit : 9;
        Pageable pageable = PageRequest.of(pageIndex, pageSize, sort);

        Specification<Course> spec = CourseSpecification.withFilters(search, category, level, price, minRating);
        Page<Course> coursePage = courseRepository.findAll(spec, pageable);

        List<CourseSummaryDto> dtos = coursePage.getContent().stream()
                .map(CourseSummaryDto::fromEntity)
                .toList();

        return PagedResult.of(dtos, coursePage.getTotalElements(), page, coursePage.getTotalPages());
    }

    @Transactional(readOnly = true)
    public CourseDetailDto getCourseById(String id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        return CourseDetailDto.fromEntity(course);
    }

    @Transactional(readOnly = true)
    public CourseDetailDto getCourseBySlug(String slug) {
        Course course = courseRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with slug: " + slug));
        return CourseDetailDto.fromEntity(course);
    }

    @Transactional(readOnly = true)
    public List<CourseSummaryDto> getPopularCourses() {
        return courseRepository.findTop4ByOrderByStudentsCountDesc().stream()
                .map(CourseSummaryDto::fromEntity)
                .toList();
    }

    @Transactional
    public CourseDetailDto createCourse(CreateCourseRequest request, Long instructorUserId) {
        String slug = toSlug(request.title());
        if (courseRepository.existsBySlug(slug)) {
            slug = slug + "-" + UUID.randomUUID().toString().substring(0, 6);
        }

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new BadRequestException("Category not found with id: " + request.categoryId()));

        Instructor instructor = instructorRepository.findByUserId(instructorUserId)
                .orElse(null);

        Course course = new Course();
        course.setId("course-" + UUID.randomUUID().toString().substring(0, 8));
        course.setSlug(slug);
        course.setTitle(request.title().trim());
        course.setSubtitle(request.subtitle().trim());
        course.setDescription(request.description().trim());
        course.setCategory(category);
        course.setLevel(request.level().toLowerCase().trim());
        course.setPrice(request.price());
        course.setOriginalPrice(request.originalPrice() != null ? request.originalPrice() : request.price().multiply(BigDecimal.valueOf(1.5)));
        course.setLanguage(request.language() != null ? request.language() : "English");
        course.setThumbnail(request.thumbnail() != null ? request.thumbnail() : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80");
        course.setPreviewVideoUrl(request.previewVideoUrl());
        course.setInstructor(instructor);
        course.setLastUpdated("Recent");
        course.setWhatYouWillLearn(request.whatYouWillLearn() != null ? request.whatYouWillLearn() : List.of());
        course.setRequirements(request.requirements() != null ? request.requirements() : List.of());

        Course saved = courseRepository.save(course);
        return CourseDetailDto.fromEntity(saved);
    }

    @Transactional
    public CourseDetailDto updateCourse(String id, UpdateCourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));

        if (request.title() != null && !request.title().isBlank()) {
            course.setTitle(request.title().trim());
        }
        if (request.subtitle() != null) {
            course.setSubtitle(request.subtitle().trim());
        }
        if (request.description() != null) {
            course.setDescription(request.description().trim());
        }
        if (request.categoryId() != null) {
            Category category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new BadRequestException("Category not found: " + request.categoryId()));
            course.setCategory(category);
        }
        if (request.level() != null) {
            course.setLevel(request.level().toLowerCase().trim());
        }
        if (request.price() != null) {
            course.setPrice(request.price());
        }
        if (request.originalPrice() != null) {
            course.setOriginalPrice(request.originalPrice());
        }
        if (request.thumbnail() != null) {
            course.setThumbnail(request.thumbnail());
        }
        if (request.previewVideoUrl() != null) {
            course.setPreviewVideoUrl(request.previewVideoUrl());
        }
        if (request.isBestseller() != null) {
            course.setBestseller(request.isBestseller());
        }
        if (request.isFeatured() != null) {
            course.setFeatured(request.isFeatured());
        }
        if (request.whatYouWillLearn() != null) {
            course.setWhatYouWillLearn(request.whatYouWillLearn());
        }
        if (request.requirements() != null) {
            course.setRequirements(request.requirements());
        }

        Course updated = courseRepository.save(course);
        return CourseDetailDto.fromEntity(updated);
    }

    @Transactional
    public void deleteCourse(String id) {
        if (!courseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Course not found with id: " + id);
        }
        courseRepository.deleteById(id);
    }

    private String toSlug(String input) {
        String nowhitespace = WHITESPACE.matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }
}
