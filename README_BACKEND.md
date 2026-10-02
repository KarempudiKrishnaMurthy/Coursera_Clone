# CourseHub Backend — Architectural & Implementation Guide

This document provides a deep, file-by-file walkthrough of the **CourseHub Spring Boot 3 + Java 21** backend service. It details the layered architecture, security pipeline, database migrations, business logic, and API endpoints.

---

## 📑 Table of Contents
- [1. Architecture & Design Principles](#1-architecture--design-principles)
- [2. Application Entry Point & Lifecycle](#2-application-entry-point--lifecycle)
  - [`CourseHubApplication.java`](#coursehubapplicationjava)
- [3. Configuration Layer (`com.coursehub.config`)](#3-configuration-layer-comcoursehubconfig)
  - [`SecurityConfig.java`](#securityconfigjava)
  - [`CorsConfig.java`](#corsconfigjava)
  - [`OpenApiConfig.java`](#openapiconfigjava)
  - [`DataInitializer.java`](#datainitializerjava)
- [4. Security & JWT Engine (`com.coursehub.security`)](#4-security--jwt-engine-comcoursehubsecurity)
  - [`JwtService.java`](#jwtservicejava)
  - [`JwtAuthenticationFilter.java`](#jwtauthenticationfilterjava)
  - [`UserDetailsServiceImpl.java`](#userdetailscompatimpljava)
- [5. Database Migrations (`db/migration/`)](#5-database-migrations-dbmigration)
  - [`V1__init_schema.sql`](#v1__init_schemasql)
  - [`V2__seed_data.sql`](#v2__seed_datasql)
- [6. JPA Domain Entities (`com.coursehub.entity`)](#6-jpa-domain-entities-comcoursehubentity)
- [7. Repositories & Specifications (`com.coursehub.repository`)](#7-repositories--specifications-comcoursehubrepository)
  - [`CourseSpecification.java`](#coursespecificationjava)
- [8. Service Layer & Business Logic (`com.coursehub.service`)](#8-service-layer--business-logic-comcoursehubservice)
  - [`AuthService.java`](#authservicejava)
  - [`CourseService.java`](#courseservicejava)
  - [`EnrollmentService.java`](#enrollmentservicejava)
  - [`CategoryService.java` & `ReviewService.java`](#categoryservicejava--reviewservicejava)
- [9. REST Controllers (`com.coursehub.controller`)](#9-rest-controllers-comcoursehubcontroller)
- [10. Data Transfer Objects (`com.coursehub.dto`)](#10-data-transfer-objects-comcoursehubdto)
- [11. Exception Handling (`com.coursehub.exception`)](#11-exception-handling-comcoursehubexception)
- [12. Configuration Profiles & Properties](#12-configuration-profiles--properties)
- [13. Unit & Integration Testing Suite](#13-unit--integration-testing-suite)

---

## 1. Architecture & Design Principles

The backend is built as a stateless, layered REST API following Domain-Driven Design (DDD) principles:

- **Layer Separation**: Strict separation between Web/HTTP (`controller`), Business Logic (`service`), and Data Access (`repository`). Controllers never speak directly to repositories.
- **Stateless Authentication**: HTTP requests carry a short-lived signed JWT in the `Authorization: Bearer` header. Sessions are not stored in server memory, making the API cloud-native and horizontally scalable.
- **Refresh Token Rotation**: Refresh tokens are stored in the PostgreSQL database with expiration timestamps and delivered to clients inside secure, `HttpOnly` cookies to protect against credential exfiltration.
- **Database Evolution via Flyway**: Zero reliance on Hibernate `ddl-auto: update`. Schema structures and seed data are strictly managed via versioned, reproducible Flyway SQL scripts with `ddl-auto: validate`.

---

## 2. Application Entry Point & Lifecycle

### `CourseHubApplication.java`
- **Location**: `com.coursehub.CourseHubApplication`
- **Key Code**:
  ```java
  @SpringBootApplication
  public class CourseHubApplication {
      public static void main(String[] args) {
          SpringApplication.run(CourseHubApplication.class, args);
      }
  }
  ```
- **What happens on startup**:
  1. Bootstraps the Spring `ApplicationContext`.
  2. Scans for components, services, controllers, and repositories under `com.coursehub.*`.
  3. Connects HikariCP connection pool to PostgreSQL.
  4. Triggers Flyway to validate existing migrations against `flyway_schema_history` and execute unapplied scripts.
  5. Validates JPA entity mappings against database tables.
  6. Starts embedded Apache Tomcat on port `8080`.

---

## 3. Configuration Layer (`com.coursehub.config`)

### `SecurityConfig.java`
- **Purpose**: Defines Spring Security 6 filter chains, authorization rules, and cryptographic encoders.
- **Key Beans**:
  - `passwordEncoder()`: Instantiates `BCryptPasswordEncoder(10)` for one-way password hashing.
  - `authenticationProvider()`: Configures a `DaoAuthenticationProvider` wired to `UserDetailsServiceImpl` and the `BCryptPasswordEncoder`.
  - `authenticationManager()`: Exposes Spring's central authentication manager used during login.
  - `securityFilterChain(HttpSecurity http)`:
    - Disables CSRF (safe for stateless JWT architectures).
    - Sets session creation policy to `SessionCreationPolicy.STATELESS`.
    - Declares public endpoints: `/api/v1/auth/**`, `/api/v1/health/**`, `/api/v1/courses/**` (GET only), `/api/v1/categories/**` (GET only), and Swagger UI paths.
    - Locks down all other paths (`/api/v1/enrollments/**`, `/api/v1/users/me`, etc.) to authenticated users.
    - Injects `JwtAuthenticationFilter` before `UsernamePasswordAuthenticationFilter`.

### `CorsConfig.java`
- **Purpose**: Cross-Origin Resource Sharing rules.
- **What it does**:
  - Reads allowed origins from `app.cors.allowed-origins` (defaulting to `http://localhost:3000` and `http://localhost:5173`).
  - Sets `setAllowCredentials(true)` — mandatory so browsers are permitted to pass cookies (for the refresh token) and Authorization headers across origins.
  - Allows standard HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`) and headers.

### `OpenApiConfig.java`
- **Purpose**: SpringDoc OpenAPI 3 / Swagger documentation generation.
- **What it does**:
  - Configures API metadata (title, version, license, description).
  - Registers the `BearerAuth` security scheme so developers can input JWT tokens directly inside the Swagger UI at `http://localhost:8080/swagger-ui.html` and execute protected endpoints.

### `DataInitializer.java`
- **Purpose**: Secondary programmatic safety net implementing `CommandLineRunner`.
- **What it does**:
  - Runs after the Spring context boots.
  - Checks if categories, users, or courses exist in the database.
  - In environments where Flyway migrations might have been bypassed (e.g. lightweight mocks), it seeds initial data programmatically using `PasswordEncoder`.

---

## 4. Security & JWT Engine (`com.coursehub.security`)

### `JwtService.java`
- **Purpose**: Cryptographic generation, parsing, and validation of JSON Web Tokens.
- **Key Mechanics**:
  - Signs tokens using HMAC-SHA384 (`Keys.hmacShaKeyFor(secret.getBytes())`) with the 256+ bit secret key configured in `app.jwt.secret`.
  - `generateAccessToken(UserDetails, extraClaims)`: Emits a JWT containing the user's email as subject, plus custom claims: `userId` and `role`. Expiration is 1 hour by default.
  - `extractUsername(token)`: Decodes claims and retrieves the subject email.
  - `isTokenValid(token, userDetails)`: Validates that the token subject matches the user and that the current timestamp is before the expiration claim.

### `JwtAuthenticationFilter.java`
- **Purpose**: Per-request security interceptor extending `OncePerRequestFilter`.
- **Execution Flow**:
  1. Inspects the incoming HTTP request for the header: `Authorization: Bearer <token>`.
  2. If absent or does not start with `Bearer `, passes the request to the next filter in the chain (allowing public endpoints to proceed).
  3. If present, extracts the token and parses the email with `jwtService.extractUsername(jwt)`.
  4. If the email is valid and no authentication exists in the current `SecurityContextHolder`:
     - Loads user details via `UserDetailsServiceImpl`.
     - Validates the token against user credentials.
     - Constructs a `UsernamePasswordAuthenticationToken` with the user's granted authorities (`ROLE_STUDENT`, `ROLE_INSTRUCTOR`, `ROLE_ADMIN`).
     - Stores the authentication object in `SecurityContextHolder.getContext().setAuthentication(authToken)`.
  5. Subsequent controllers and security annotations (`@PreAuthorize`) can now inspect the authenticated principal.

### `UserDetailsServiceImpl.java`
- **Purpose**: Bridges Spring Security's `UserDetailsService` contract with the PostgreSQL `users` table.
- **Method**:
  - `loadUserByUsername(String email)`: Queries `userRepository.findByEmail(email)`. Maps the `User` entity to Spring Security's `org.springframework.security.core.userdetails.User` with granted authority `ROLE_<ROLE_NAME>`.

---

## 5. Database Migrations (`db/migration/`)

Flyway manages database versioning. Migration scripts reside in `backend/src/main/resources/db/migration/`.

### `V1__init_schema.sql`
Creates the relational schema with indexes, foreign key constraints, and cascade delete rules:
- `users`: Core account details, bcrypt password hashes, and user roles.
- `user_enrolled_course_ids`: ElementCollection join table caching user course IDs.
- `categories`: High-level domains (`web-dev`, `data-science`, etc.).
- `instructors`: Teacher bios, ratings, and student counts.
- `courses`: Pricing, level, ratings, descriptions, thumbnail URLs.
- `course_learning_points`: Bullet points describing what the course teaches.
- `course_requirements`: Prerequisites for taking the course.
- `course_sections`: Modules within a course.
- `lessons`: Individual video lectures with duration and free preview flags.
- `enrollments`: Student registration records linking `user_id` and `course_id` with overall progress percentages.
- `enrollment_progress`: Granular tracking of completed lessons per enrollment.
- `reviews`: Student ratings (1-5) and written feedback.
- `refresh_tokens`: Active JWT refresh tokens tied to `user_id` with expiration dates.

### `V2__seed_data.sql`
Populates comprehensive demo data:
- 7 Categories with Lucide icon keys and counts.
- 6 Pre-seeded Users with valid BCrypt password hashes for `password123`.
- 4 Detailed Instructor profiles.
- 8 Complete Courses covering all categories, price tiers, and difficulty levels, complete with curriculum sections and lectures.
- Sample student enrollments and reviews.

---

## 6. JPA Domain Entities (`com.coursehub.entity`)

All entities are located in `com.coursehub.entity`:

| Entity | Table Name | Purpose & Key Fields |
| :--- | :--- | :--- |
| **`User.java`** | `users` | Core user entity (`email`, `password`, `name`, `role`, `headline`, `bio`, `avatar`, `enrolledCourseIds`). |
| **`Role.java`** | *(Enum)* | Enumeration of user roles: `STUDENT`, `INSTRUCTOR`, `ADMIN`. |
| **`Category.java`** | `categories` | Course domain categories (`id`, `name`, `icon`, `count`). |
| **`Instructor.java`** | `instructors` | Instructor public profile linked to `User` (`headline`, `avatar`, `bio`, `rating`, `studentsCount`). |
| **`Course.java`** | `courses` | Full course entity with `@OneToMany` cascades to sections, learning points, and requirements. |
| **`CourseSection.java`**| `course_sections` | Section grouping containing ordered lessons (`title`, `sortOrder`, `lessons`). |
| **`SectionLesson.java`** | `lessons` | Lecture entity (`title`, `duration`, `videoUrl`, `isFreePreview`, `sortOrder`). |
| **`Enrollment.java`** | `enrollments` | Student course enrollment record (`progressPercent`, `lastAccessedLessonId`, `lastAccessedAt`). |
| **`LessonCompletion.java`**| `enrollment_progress` | Junction record marking a specific lesson completed for an enrollment. |
| **`Review.java`** | `reviews` | Student course review (`rating`, `comment`, `userName`, `userAvatar`). |
| **`RefreshToken.java`**| `refresh_tokens` | Persisted session token (`token`, `expiryDate`, `user`). |

---

## 7. Repositories & Specifications (`com.coursehub.repository`)

Spring Data JPA repositories automatically generate SQL queries from interface method names:

- **`UserRepository`**: `findByEmail(String email)`, `existsByEmail(String email)`.
- **`CourseRepository`**: Extends `JpaRepository` and `JpaSpecificationExecutor<Course>` to support dynamic multi-criteria filtering.
- **`EnrollmentRepository`**: `findByUserId(Long userId)`, `findByUserIdAndCourseId(Long userId, String courseId)`.
- **`RefreshTokenRepository`**: `findByToken(String token)`, `deleteByToken(String token)`, `deleteByUser(User user)`.
- **`ReviewRepository`**: `findByCourseIdOrderByCreatedAtDesc(String courseId)`.

### `CourseSpecification.java`
- **Purpose**: Dynamic JPA Criteria API query builder.
- **Capabilities**:
  - Dynamically builds SQL `WHERE` clauses based on incoming query params:
    - Search query matching title, subtitle, or description (`ILIKE %term%`).
    - Category matching (`category.id = :categoryId`).
    - Difficulty level matching (`level = :level`).
    - Price range bounds (`price >= :minPrice AND price <= :maxPrice`).
    - Minimum rating filter (`rating >= :minRating`).

---

## 8. Service Layer & Business Logic (`com.coursehub.service`)

### `AuthService.java`
- **Responsibilities**:
  - **`register(RegisterRequest)`**: Validates email uniqueness, encodes password with BCrypt, saves user, emits access token, creates refresh token in database.
  - **`login(LoginRequest)`**: Authenticates credentials using `AuthenticationManager`. On success, generates a fresh access token and creates/updates the database refresh token.
  - **`refreshToken(String rawToken)`**: Finds refresh token in database, verifies that `expiryDate` is in the future, loads user details, and generates a new access token.
  - **`logout(String email, String token)`**: Revokes the refresh token from the database, invalidating the session.

### `CourseService.java`
- **Responsibilities**:
  - Catalog querying with pagination, sorting (`most-popular`, `highest-rated`, `newest`, `price-low`, `price-high`), and specification filtering.
  - Retrieving featured and trending courses.
  - Fetching complete course syllabus and curriculum by slug.

### `EnrollmentService.java`
- **Responsibilities**:
  - **`enroll(Long userId, String courseId)`**: Validates course exists, creates `Enrollment`, appends course ID to the user's `enrolledCourseIds` cache list.
  - **`completeLesson(Long userId, String courseId, String lessonId)`**: Records a `LessonCompletion`, counts completed lessons vs total lessons in the course, recalculates `progressPercent`, and updates `lastAccessedLessonId`.
  - **`getUserEnrollments(Long userId)`**: Returns all active student courses with progress metrics.

---

## 9. REST Controllers (`com.coursehub.controller`)

Controllers receive HTTP requests, validate input bodies with `@Valid`, invoke services, and return standard `ResponseEntity<T>`:

| Controller | Base Path | Key Endpoints | Access |
| :--- | :--- | :--- | :--- |
| **`AuthController`** | `/api/v1/auth` | `POST /register`, `POST /login`, `POST /refresh`, `POST /logout` | Public (Refresh token sent/received via HttpOnly cookie) |
| **`CourseController`** | `/api/v1/courses`| `GET /`, `GET /popular`, `GET /featured`, `GET /{slug}` | Public |
| **`CategoryController`**| `/api/v1/categories`| `GET /` | Public |
| **`EnrollmentController`**| `/api/v1/enrollments`| `GET /my-courses`, `POST /`, `POST /{courseId}/lessons/{lessonId}/complete` | Authenticated (`STUDENT`, `INSTRUCTOR`, `ADMIN`) |
| **`UserController`** | `/api/v1/users` | `GET /me`, `PUT /me` | Authenticated |
| **`ReviewController`** | `/api/v1/courses/{courseId}/reviews` | `GET /`, `POST /` | GET: Public, POST: Enrolled Students |
| **`HealthController`** | `/api/v1/health` | `GET /` | Public (Returns uptime and system timestamp) |

---

## 10. Data Transfer Objects (`com.coursehub.dto`)

Implemented as modern **Java Records** for immutable, concise data modeling:

- **`RegisterRequest`**: Validates `name` (`@NotBlank`), `email` (`@Email`), and `password` (`@Size(min = 6)`).
- **`LoginRequest`**: Validates non-blank email and password.
- **`AuthResponse`**: Returns JWT access token and user profile record.
- **`CourseDto` & `CourseDetailDto`**: Maps entities to clean JSON payloads, hiding internal database fields.
- **`EnrollmentDto`**: Details student progress percentage, enrollment date, and last accessed lecture.

---

## 11. Exception Handling (`com.coursehub.exception`)

### `GlobalExceptionHandler.java`
- Annotated with `@RestControllerAdvice`.
- Catches uncaught exceptions application-wide and transforms them into standardized `ErrorResponse` JSON objects:
  - `MethodArgumentNotValidException` ──► `400 Bad Request` with field-by-field validation error messages.
  - `BadRequestException` ──► `400 Bad Request`.
  - `UnauthorizedException` / `BadCredentialsException` ──► `401 Unauthorized`.
  - `ResourceNotFoundException` ──► `404 Not Found`.
  - `AccessDeniedException` ──► `403 Forbidden`.
  - `Exception` (fallback) ──► `500 Internal Server Error`.

---

## 12. Configuration Profiles & Properties

- **`application.yml`**: Shared defaults (port `8080`, Swagger paths, JWT expiration durations).
- **`application-dev.yml`**: Local development profile.
  - Uses `jdbc:postgresql://localhost:5432/coursehub_db`.
  - Driver: `org.postgresql.Driver`.
  - `ddl-auto: validate` (ensures Hibernate does not modify Flyway schemas).
  - Configures Flyway `locations: classpath:db/migration`.
- **`application-prod.yml`**: Production profile with environment variable overrides and optimized Hikari connection pools.

---

## 13. Unit & Integration Testing Suite

Located in `backend/src/test/java/com/coursehub/`:

- **`AuthServiceTest.java`**:
  - Unit tests for user registration, duplicate email handling, login validation, token refresh, and logout token revocation.
  - Uses **Mockito** (`@ExtendWith(MockitoExtension.class)`) to mock repositories and token services.
- **`CourseHubApplicationTests.java`**:
  - Smoke test confirming the Spring Boot application context boots without bean collision or circular dependencies.
