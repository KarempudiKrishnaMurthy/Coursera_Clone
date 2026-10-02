# CourseHub Frontend — Architectural & Implementation Guide

This document provides a deep, file-by-file walkthrough of the **CourseHub React 18 + TypeScript** client application. It explains the purpose, architecture, state flow, and internal mechanics of each module in the frontend.

---

## 📑 Table of Contents
- [1. Architecture & Design Principles](#1-architecture--design-principles)
- [2. Application Bootstrapping & Global Setup](#2-application-bootstrapping--global-setup)
  - [`index.html`](#indexhtml)
  - [`src/main.tsx`](#srcmaintsex)
  - [`src/App.tsx`](#srcapptsx)
  - [`src/index.css`](#srcindexcss)
- [3. Routing & Code-Splitting (`src/routes/`)](#3-routing--code-splitting-srcroutes)
  - [`src/routes/index.tsx`](#srcroutesindextsx)
- [4. Global State Stores (`src/store/`)](#4-global-state-stores-srcstore)
  - [`authStore.ts`](#authstorets)
  - [`cartStore.ts`](#cartstorets)
  - [`enrollmentStore.ts`](#enrollmentstorets)
- [5. API & Network Services (`src/services/`)](#5-api--network-services-srcservices)
  - [`apiClient.ts`](#apiclientts)
  - [`auth.service.ts`](#authservicets)
  - [`courses.service.ts`](#coursesservicets)
  - [`enrollments.service.ts`](#enrollmentsservicets)
- [6. UI Primitives & Design System (`src/components/ui/`)](#6-ui-primitives--design-system-srccomponentsui)
- [7. Layout Components (`src/components/layout/`)](#7-layout-components-srccomponentslayout)
- [8. Feature Components (`src/components/courses/` & `common/`)](#8-feature-components-srccomponentscourses--common)
- [9. Pages & Views (`src/pages/`)](#9-pages--views-srcpages)
- [10. TypeScript Type System (`src/types/`)](#10-typescript-type-system-srctypes)
- [11. Build & Tooling Configuration](#11-build--tooling-configuration)

---

## 1. Architecture & Design Principles

CourseHub's frontend follows a modular, scalable React enterprise architecture:

- **Unidirectional Data Flow**: State lives in centralized Zustand stores or local page state and flows down through props.
- **In-Memory JWT + HttpOnly Refresh Token**: The short-lived access token is held strictly in memory (via closures and Zustand), never touching `localStorage` to safeguard against XSS attacks. The refresh token is managed by the browser in an `HttpOnly, Secure, SameSite=Lax` cookie.
- **Route-Level Code Splitting**: All major pages are lazy-loaded via `React.lazy()` and wrapped in suspense boundaries with fallback skeletons, optimizing initial load performance.
- **Accessible Design System**: Built on top of Tailwind CSS and Radix UI primitives (`@radix-ui/react-*`), following WCAG accessibility guidelines.

---

## 2. Application Bootstrapping & Global Setup

### `index.html`
- **Purpose**: Single Page Application (SPA) entry HTML host.
- **What happens here**:
  - Sets viewport configurations for mobile responsiveness.
  - Preloads Inter and Outfit Google Fonts for high-fidelity typography.
  - Mounts the root container `<div id="root"></div>`.
  - Injects the main TypeScript entry script `/src/main.tsx`.

### `src/main.tsx`
- **Purpose**: React application mounting and React 18 Concurrent Mode activation.
- **Key Code**:
  ```tsx
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  ```
- **What happens here**:
  - Acquires the DOM root element.
  - Wraps the tree in `React.StrictMode` to detect side-effects, deprecated APIs, and unexpected lifecycle triggers during development.

### `src/App.tsx`
- **Purpose**: Root application component, session bootstrapper, and router provider.
- **What happens here**:
  - Invokes `useAuthStore((state) => state.initAuth)` on mount via a `useEffect`.
  - When a user refreshes the page or opens the app, `initAuth()` silently calls the backend refresh endpoint (`/api/v1/auth/refresh`) using the browser's HttpOnly cookie. If a session is valid, user credentials and a fresh access token are populated into memory without forcing the user to log in again.
  - Renders `<RouterProvider router={router} />` to connect the React Router definitions.

### `src/index.css`
- **Purpose**: Global CSS definitions and Tailwind directive injection.
- **What happens here**:
  - Injects Tailwind layers: `@tailwind base;`, `@tailwind components;`, `@tailwind utilities;`.
  - Declares CSS custom properties (`--background`, `--foreground`, `--primary`, `--card`, `--radius`) to empower dark/light mode consistency and theme harmonization across Radix UI primitives.
  - Fixes default body typography, antialiasing (`-webkit-font-smoothing: antialiased`), and sets `overflow-x: hidden` to prevent accidental mobile layout shifts.

---

## 3. Routing & Code-Splitting (`src/routes/`)

### `src/routes/index.tsx`
- **Purpose**: Centralized route table and route security guards.
- **Mechanics**:
  - Uses `createBrowserRouter` from `react-router-dom` (Data Router API).
  - Implements **dynamic imports** via `React.lazy()`:
    ```tsx
    const HomePage = lazy(() => import('@/pages/Home/HomePage'));
    const CatalogPage = lazy(() => import('@/pages/Catalog/CatalogPage'));
    const CourseDetailPage = lazy(() => import('@/pages/CourseDetail/CourseDetailPage'));
    const DashboardPage = lazy(() => import('@/pages/Dashboard/DashboardPage'));
    const LessonPlayerPage = lazy(() => import('@/pages/LearningPlayer/LessonPlayerPage'));
    ```
  - **`Suspense` Wrapper**: Each lazy route is wrapped in `<Suspense fallback={<PageSkeleton />}>` to display graceful loading skeletons while JS chunks download.
  - **`ProtectedRoute` Component**:
    - Checks `isAuthenticated` from `useAuthStore`.
    - If the user is unauthenticated, redirects to `/auth/login` while preserving the intended destination in `location.state.from`.
  - **Route Hierarchy**:
    - `/` ── Public Landing Page.
    - `/courses` ── Filterable Catalog & Search.
    - `/courses/:slug` ── Detailed Course Overview, Curriculum, Reviews & Syllabus.
    - `/auth/login` & `/auth/register` ── Authentication Screens.
    - `/dashboard` ── **Protected**: Enrolled courses, completion metrics, recent progress.
    - `/learn/:courseId/lecture/:lessonId` ── **Protected**: Interactive video curriculum player.
    - `/checkout` ── **Protected**: Order review and enrollment confirmation.
    - `/profile` ── **Protected**: User settings, bio, and credentials management.

---

## 4. Global State Stores (`src/store/`)

CourseHub utilizes **Zustand** for lightweight, decoupled, reactive state management.

### `authStore.ts`
- **Purpose**: Authenticated user state, permissions, and session lifecycle.
- **State Properties**:
  - `user: User | null` — Current logged-in user profile (`id`, `name`, `email`, `role`, `avatar`, `headline`).
  - `isAuthenticated: boolean` — Quick boolean guard for route protection and navbar UI toggles.
  - `isLoading: boolean` — True while performing login, registration, or initial session handshake.
- **Key Actions**:
  - `login(email, password)`: Dispatches login payload to backend, extracts access token to memory, updates user profile state.
  - `register(data)`: Creates a new user account, stores authentication credentials.
  - `logout()`: Informs backend to revoke refresh token and clear cookie, cleans local Zustand memory and redirects.
  - `initAuth()`: Invoked on app start; attempts silent token refresh from cookie to resume ongoing sessions seamlessly.

### `cartStore.ts`
- **Purpose**: Shopping cart persistence for non-enrolled courses.
- **Features**:
  - Keeps track of courses the user plans to purchase or enroll in.
  - Persisted to browser storage with Zustand's `persist` middleware so selections survive page refreshes.
  - Computes subtotal, original price discounts, and item count.

### `enrollmentStore.ts`
- **Purpose**: Tracking active learner enrollments and lesson progress in real time.
- **Key Actions**:
  - `fetchUserEnrollments()`: Loads all courses the active student is currently taking.
  - `updateLessonProgress(courseId, lessonId)`: Marks a curriculum lecture as completed and recalculates overall percentage progress.
  - `isCourseEnrolled(courseId)`: Helper used across catalog cards and course detail pages to swap "Enroll Now" for "Go to Course".

---

## 5. API & Network Services (`src/services/`)

### `apiClient.ts`
- **Purpose**: Enterprise Axios client configuration, request token injection, and automatic 401 token refresh interceptor.
- **Key Implementation Details**:
  - **Base URL**: Defaults to `/api/v1`, automatically routing through the Vite reverse proxy in development.
  - **`withCredentials: true`**: Crucial setting that instructs the browser to include the `refreshToken` HttpOnly cookie in cross-origin and proxied HTTP requests.
  - **In-Memory Access Token**: Access token is stored in an unexported module closure variable (`inMemoryAccessToken`) with getters/setters, shielding it from browser window global access.
  - **Request Interceptor**: Automatically attaches `Authorization: Bearer <inMemoryAccessToken>` to outgoing API calls when an active token exists.
  - **Response Interceptor (Automatic Silent Refresh)**:
    - If any API call returns `401 Unauthorized`, the interceptor catches it.
    - It checks if a refresh is already in progress (using a promise queue to prevent duplicate refresh calls).
    - Dispatches a request to `/api/v1/auth/refresh`.
    - If refreshed, retries the original failed request with the new access token.
    - If refresh fails, purges auth state and redirects to `/auth/login`.

### `auth.service.ts`
- **Purpose**: Encapsulates all authentication network operations.
- **Methods**:
  - `login(credentials)`: Calls `POST /auth/login`.
  - `register(payload)`: Calls `POST /auth/register`.
  - `refreshToken()`: Calls `POST /auth/refresh`.
  - `logout()`: Calls `POST /auth/logout`.
  - `getCurrentUser()`: Calls `GET /users/me`.

### `courses.service.ts`
- **Purpose**: Course catalog query operations.
- **Methods**:
  - `getCourses(filters)`: Supports category filtering, search keyword queries, difficulty level filters, sorting, and pagination.
  - `getFeaturedCourses()`: Retrieves top-rated featured courses for the hero landing page.
  - `getPopularCourses()`: Retrieves trending courses.
  - `getCourseBySlug(slug)`: Retrieves complete course tree (sections, lectures, requirements, instructor profile, and student reviews).
  - `getCategories()`: Retrieves all course categories with icon and count metadata.

### `enrollments.service.ts`
- **Purpose**: Manages student enrollments and curriculum progress.
- **Methods**:
  - `enrollCourse(courseId)`: Registers student into a course.
  - `getMyEnrollments()`: Fetches list of enrolled courses with progress percentages.
  - `completeLesson(enrollmentId, lessonId)`: Records that a student completed a specific lecture.

---

## 6. UI Primitives & Design System (`src/components/ui/`)

CourseHub utilizes a curated implementation of **shadcn/ui** built with **Radix UI primitives** and styled with **Tailwind CSS**:

- **[`button.tsx`](file:///c:/Users/91949/OneDrive/Desktop/Coursera_Clone/src/components/ui/button.tsx)**: Built with `class-variance-authority` (cva). Supports variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link` with custom sizing tokens (`sm`, `md`, `lg`, `icon`).
- **[`badge.tsx`](file:///c:/Users/91949/OneDrive/Desktop/Coursera_Clone/src/components/ui/badge.tsx)**: Informational badges for course difficulty (`Beginner`, `Intermediate`, `All Levels`) and bestseller labels.
- **[`card.tsx`](file:///c:/Users/91949/OneDrive/Desktop/Coursera_Clone/src/components/ui/card.tsx)**: Composable card building blocks: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
- **[`dialog.tsx`](file:///c:/Users/91949/OneDrive/Desktop/Coursera_Clone/src/components/ui/dialog.tsx)**: Accessible modal dialogs powered by `@radix-ui/react-dialog` for preview videos and interactive modals.
- **[`dropdown-menu.tsx`](file:///c:/Users/91949/OneDrive/Desktop/Coursera_Clone/src/components/ui/dropdown-menu.tsx)**: Accessible floating menus for user profile navigation, notifications, and mobile navigation.
- **[`input.tsx`](file:///c:/Users/91949/OneDrive/Desktop/Coursera_Clone/src/components/ui/input.tsx)**: Standardized form text input with focus ring harmonization, disabled states, and error borders.

---

## 7. Layout Components (`src/components/layout/`)

- **[`Navbar.tsx`](file:///c:/Users/91949/OneDrive/Desktop/Coursera_Clone/src/components/layout/Navbar.tsx)**:
  - Top-level persistent header.
  - Features real-time course search input, category dropdown, dynamic shopping cart badge, and auth buttons.
  - When authenticated: Displays user avatar, greeting, dropdown menu with links to "My Learning", "Profile", and "Sign Out".
  - Full mobile responsive menu with slide-out overlay.
- **[`Footer.tsx`](file:///c:/Users/91949/OneDrive/Desktop/Coursera_Clone/src/components/layout/Footer.tsx)**:
  - Multi-column footer containing category links, legal disclosures, newsletter subscription box, language selector, and social icons.
- **[`PageShell.tsx`](file:///c:/Users/91949/OneDrive/Desktop/Coursera_Clone/src/components/layout/PageShell.tsx)**:
  - Wrapper that sandwiches view content between `Navbar` and `Footer` with flexbox sticky layout.

---

## 8. Feature Components (`src/components/courses/` & `common/`)

- **[`CourseCard.tsx`](file:///c:/Users/91949/OneDrive/Desktop/Coursera_Clone/src/components/courses/CourseCard.tsx)**:
  - The universal course card used in Home, Catalog, and Carousels.
  - Displays thumbnail image with aspect ratio preservation, bestseller/featured badges, title, instructor name, rating star calculation, student count, and price calculation (showing discount comparison).
  - Hover micro-animations with subtle elevation shadows.
- **[`RatingStars.tsx`](file:///c:/Users/91949/OneDrive/Desktop/Coursera_Clone/src/components/common/RatingStars.tsx)**:
  - Dynamically renders filled, half-filled, and empty stars based on numerical float rating (e.g. `4.8`).

---

## 9. Pages & Views (`src/pages/`)

### `pages/Home/HomePage.tsx`
- The landing page.
- Features:
  - Hero banner with CTA button and search bar.
  - Interactive category cards grid (fetching category statistics from API).
  - Featured & Bestseller courses carousel sections.
  - Value proposition section ("Why learn with CourseHub?").

### `pages/Catalog/CatalogPage.tsx`
- Search & browse catalog.
- Features:
  - Left sidebar filters: Category checkboxes, difficulty level radios, price range, minimum rating filter.
  - Top bar sorting: `Most Popular`, `Highest Rated`, `Newest`, `Price: Low to High`.
  - Grid of matching `CourseCard` items with responsive pagination.

### `pages/CourseDetail/CourseDetailPage.tsx`
- Complete syllabus and enrollment overview.
- Features:
  - Hero header with breadcrumb, title, rating, instructor headline, last updated date, and language.
  - Floating sticky checkout card on desktop showing video preview thumbnail, pricing, "Enroll Now" or "Go to Course" CTA, and course guarantee items.
  - "What you'll learn" bullet points grid.
  - Expandable Curriculum accordion sections detailing every lesson and video duration.
  - Instructor bio card and student review ratings breakdown.

### `pages/Dashboard/DashboardPage.tsx`
- Enrolled student portal.
- Features:
  - Learning progress summary (total enrolled courses, hours learned, completed certificates).
  - "In Progress" courses grid displaying progress bars and "Resume Lecture" quick-action buttons.

### `pages/LearningPlayer/LessonPlayerPage.tsx`
- Video lecture curriculum player.
- Features:
  - Full-width HTML5 video player with playback controls.
  - Collapsible curriculum sidebar allowing students to navigate through sections and click lectures.
  - "Mark as Complete" button that synchronizes lesson completion with the backend API and advances to the next lecture.

### `pages/Auth/LoginPage.tsx` & `pages/Auth/RegisterPage.tsx`
- Authentication forms using **React Hook Form** + **Zod Schema Validation**.
- Real-time client-side error checking (email format, password min length).
- Integrated demo-account quick-fill button for friction-free evaluation.

---

## 10. TypeScript Type System (`src/types/index.ts`)

Defines strict type safety contracts matching the backend DTOs:

- `User`: Profile entity fields (`id`, `email`, `name`, `headline`, `bio`, `avatar`, `role`).
- `Course`: Course metadata, pricing, rating metrics, instructor relationships, and category tags.
- `CourseSection` & `Lesson`: Nested curriculum hierarchy.
- `Enrollment`: Active learner state, progress percentages, and last accessed lesson identifiers.
- `Category`: Categories metadata with counts and Lucide icon keys.

---

## 11. Build & Tooling Configuration

- **[`vite.config.ts`](file:///c:/Users/91949/OneDrive/Desktop/Coursera_Clone/vite.config.ts)**:
  - Configures `@vitejs/plugin-react`.
  - Sets up path alias `@` -> `./src`.
  - Proxies `/api` -> `http://127.0.0.1:8080` (IPv4) to avoid Windows IPv6 resolution latency.
  - **Manual Chunks Rollup Optimization**: Splits bundles into `vendor-react` (React, React Router), `vendor-ui` (Radix UI, Lucide), and `vendor-form` (React Hook Form, Zod) to reduce chunk size warnings and improve browser caching.
- **[`tailwind.config.js`](file:///c:/Users/91949/OneDrive/Desktop/Coursera_Clone/tailwind.config.js)**:
  - Tailored color palette with customized primary blues, neutral grays, and semantic status colors.
  - Configures font families (`Inter`, `Outfit`) and animation tokens.
- **[`tsconfig.json`](file:///c:/Users/91949/OneDrive/Desktop/Coursera_Clone/tsconfig.json)**:
  - Strict TypeScript 5 configuration with path aliases and DOM library definitions.
