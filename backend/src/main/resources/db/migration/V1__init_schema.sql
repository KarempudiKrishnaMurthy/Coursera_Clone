-- ========================================================
-- CourseHub V1 Database Schema Migration
-- Database: PostgreSQL 16
-- Core Schema: Users, Courses, Sections, Lessons,
--              Enrollments, Progress, Reviews, Auth Tokens
-- ========================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    headline VARCHAR(255),
    bio TEXT,
    avatar VARCHAR(500),
    role VARCHAR(50) NOT NULL DEFAULT 'STUDENT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. User Enrolled Course IDs (ElementCollection Cache)
CREATE TABLE IF NOT EXISTS user_enrolled_course_ids (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id VARCHAR(100) NOT NULL,
    PRIMARY KEY (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_user_enrolled_courses_course_id ON user_enrolled_course_ids(course_id);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(100),
    count INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- 4. Instructors Table
CREATE TABLE IF NOT EXISTS instructors (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    headline VARCHAR(255),
    avatar VARCHAR(500),
    bio TEXT,
    rating NUMERIC(3, 2) DEFAULT 5.0 CHECK (rating >= 0.0 AND rating <= 5.0),
    students_count INT DEFAULT 0 CHECK (students_count >= 0),
    courses_count INT DEFAULT 0 CHECK (courses_count >= 0)
);

CREATE INDEX IF NOT EXISTS idx_instructors_user_id ON instructors(user_id);

-- 5. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(100) PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    description TEXT,
    category_id VARCHAR(100) REFERENCES categories(id) ON DELETE SET NULL,
    level VARCHAR(50) NOT NULL DEFAULT 'all',
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0.00),
    original_price NUMERIC(10, 2),
    rating NUMERIC(3, 2) DEFAULT 0.0 CHECK (rating >= 0.0 AND rating <= 5.0),
    ratings_count INT DEFAULT 0 CHECK (ratings_count >= 0),
    students_count INT DEFAULT 0 CHECK (students_count >= 0),
    language VARCHAR(100) DEFAULT 'English',
    last_updated VARCHAR(100),
    thumbnail VARCHAR(500),
    preview_video_url VARCHAR(500),
    instructor_id BIGINT REFERENCES instructors(id) ON DELETE SET NULL,
    is_bestseller BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_category_id ON courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_price ON courses(price);
CREATE INDEX IF NOT EXISTS idx_courses_rating ON courses(rating);
CREATE INDEX IF NOT EXISTS idx_courses_students_count ON courses(students_count);
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON courses(instructor_id);

-- 6. Course Learning Points
CREATE TABLE IF NOT EXISTS course_learning_points (
    id BIGSERIAL PRIMARY KEY,
    course_id VARCHAR(100) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    point TEXT NOT NULL,
    sort_order INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_course_learning_points_course_id ON course_learning_points(course_id);

-- 7. Course Requirements
CREATE TABLE IF NOT EXISTS course_requirements (
    id BIGSERIAL PRIMARY KEY,
    course_id VARCHAR(100) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    requirement TEXT NOT NULL,
    sort_order INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_course_requirements_course_id ON course_requirements(course_id);

-- 8. Course Sections
CREATE TABLE IF NOT EXISTS course_sections (
    id VARCHAR(100) PRIMARY KEY,
    course_id VARCHAR(100) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_course_sections_course_id ON course_sections(course_id);

-- 9. Lessons (Curriculum units inside course sections)
CREATE TABLE IF NOT EXISTS lessons (
    id VARCHAR(100) PRIMARY KEY,
    section_id VARCHAR(100) NOT NULL REFERENCES course_sections(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    video_url VARCHAR(500),
    is_free_preview BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_lessons_section_id ON lessons(section_id);

-- 10. Enrollments (Student course registration & overall status)
CREATE TABLE IF NOT EXISTS enrollments (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id VARCHAR(100) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    progress_percent INT DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    last_accessed_lesson_id VARCHAR(100),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_enrollments_user_course UNIQUE (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);

-- 11. Enrollment Progress (Per-lesson completions for enrolled learners)
CREATE TABLE IF NOT EXISTS enrollment_progress (
    id BIGSERIAL PRIMARY KEY,
    enrollment_id BIGINT NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    lesson_id VARCHAR(100) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_enrollment_progress_lesson UNIQUE (enrollment_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollment_progress_enrollment_id ON enrollment_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_progress_lesson_id ON enrollment_progress(lesson_id);

-- 12. Course Reviews (Student ratings and written feedback)
CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY,
    course_id VARCHAR(100) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    user_avatar VARCHAR(500),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_course_id ON reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- 13. Refresh Tokens (JWT Session persistence)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL UNIQUE,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
