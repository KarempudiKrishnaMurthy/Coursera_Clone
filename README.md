# CourseHub — E-Learning Platform

A full-stack, enterprise-grade online learning platform clone built with **React 18 + TypeScript + Tailwind CSS** on the frontend and **Spring Boot 3 + Java 21 + PostgreSQL** on the backend.

> 📚 **Deep Architecture & Implementation Guides:**
> - 🎨 **[Frontend In-Depth Guide (README_FRONTEND.md)](file:///c:/Users/91949/OneDrive/Desktop/Coursera_Clone/README_FRONTEND.md)** — File-by-file walkthrough of React 18, Zustand stores, Axios interceptors, shadcn/ui primitives, and routes.
> - ⚙ **[Backend In-Depth Guide (README_BACKEND.md)](file:///c:/Users/91949/OneDrive/Desktop/Coursera_Clone/README_BACKEND.md)** — File-by-file walkthrough of Spring Boot 3, JWT security filter, JPA entities, Flyway migrations, and REST controllers.

---

## 📑 Table of Contents
- [In-Depth Documentation](#-in-depth-documentation)
- [Tech Stack](#-tech-stack)
- [System Requirements](#-system-requirements)
- [Architecture & Ports](#-architecture--ports)
- [Configuration & Environment Variables](#-configuration--environment-variables)
- [Getting Started](#-getting-started)
  - [Option A: Local Development (Recommended)](#option-a-local-development-step-by-step)
  - [Option B: Docker Compose (All-in-One)](#option-b-docker-compose)
- [Pre-Seeded Demo Accounts](#-pre-seeded-demo-accounts)
- [API Documentation & Useful Endpoints](#-api-documentation--useful-endpoints)
- [Common Troubleshooting](#-common-troubleshooting)

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS + Radix UI primitives (`shadcn/ui` design system)
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **HTTP Client**: Axios (with JWT interceptors & HttpOnly cookie support)
- **Routing**: React Router DOM 6 (with lazy loading & code splitting)

### Backend
- **Framework**: Spring Boot 3.3.4
- **Language**: Java 21
- **Database**: PostgreSQL 16+ (compatible with PostgreSQL 18)
- **Migration Engine**: Flyway (automatic schema and seed migrations)
- **Security**: Spring Security 6 + JWT (Access Token in memory, Refresh Token in HttpOnly cookie)
- **Persistence**: Spring Data JPA / Hibernate
- **API Docs**: SpringDoc OpenAPI (Swagger UI)

---

## 💻 System Requirements

Before running the application, make sure the following are installed:

| Tool | Minimum Version | Check Command |
| :--- | :--- | :--- |
| **Node.js** | `v18.x` or `v20.x+` | `node -v` |
| **npm** | `v9.x+` | `npm -v` |
| **Java JDK** | `21` | `java -version` |
| **PostgreSQL** | `16+` (or Docker) | `psql -V` |
| **Git** | Any recent version | `git --version` |

---

## 🌐 Architecture & Ports

| Service | Port | Description |
| :--- | :--- | :--- |
| **Frontend** | `3000` | Vite Dev Server (`http://localhost:3000`) |
| **Backend API** | `8080` | Spring Boot REST API (`http://127.0.0.1:8080`) |
| **PostgreSQL** | `5432` | Relational Database |
| **Swagger UI** | `8080` | Interactive API documentation (`http://localhost:8080/swagger-ui.html`) |

> Vite proxies all `/api/*` calls from port `3000` directly to `http://127.0.0.1:8080`, preventing CORS issues during local development.

---

## ⚙ Configuration & Environment Variables

### 1. Backend (`backend/src/main/resources/application-dev.yml`)

The backend automatically reads these environment variables with sensible development defaults:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/coursehub_db` | JDBC connection string |
| `SPRING_DATASOURCE_USERNAME` | `postgres` | PostgreSQL username |
| `SPRING_DATASOURCE_PASSWORD` | `postgres` (or your local password) | PostgreSQL user password |
| `JWT_SECRET` | *(Built-in 256-bit development secret)* | Key used to sign JWT tokens |
| `JWT_ACCESS_EXPIRATION_MS` | `3600000` (1 hour) | Access token lifetime |
| `JWT_REFRESH_EXPIRATION_MS` | `604800000` (7 days) | Refresh token lifetime |
| `JWT_COOKIE_SECURE` | `false` | Set `true` in HTTPS production |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:5173` | Allowed frontend origins |

### 2. Frontend (`.env` - Optional)

The frontend works out of the box with Vite's proxy. If you need a custom backend URL:

```env
# Optional: defaults to /api/v1 (proxied by Vite)
VITE_API_URL=/api/v1
```

---

## 🚀 Getting Started

### Option A: Local Development (Step-by-Step)

#### Step 1: Set Up PostgreSQL Database

1. Ensure the PostgreSQL service is running on your machine.
2. Open a terminal or PostgreSQL CLI (`psql`) and create the database:
   ```sql
   CREATE DATABASE coursehub_db;
   ```
   *(On Windows PowerShell, you can run:)*
   ```powershell
   & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE coursehub_db;"
   ```

#### Step 2: Start the Spring Boot Backend

1. Open a new terminal in the `backend/` directory:
   ```powershell
   cd backend
   ```

2. Set your PostgreSQL password for the session (replace with your actual password):
   - **Windows PowerShell**:
     ```powershell
     $env:SPRING_DATASOURCE_PASSWORD="your_postgres_password"
     ```
   - **Linux / macOS**:
     ```bash
     export SPRING_DATASOURCE_PASSWORD="your_postgres_password"
     ```

   *(Optional Tip: Set it permanently on Windows so you don't need to retype it:)*
   ```powershell
   [System.Environment]::SetEnvironmentVariable("SPRING_DATASOURCE_PASSWORD", "your_postgres_password", "User")
   ```

3. Run the backend using the Maven wrapper:
   - **Windows**:
     ```powershell
     .\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"
     ```
   - **Linux / macOS**:
     ```bash
     ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
     ```

4. The backend will:
   - Connect to PostgreSQL.
   - Automatically execute Flyway migrations (`V1__init_schema.sql` and `V2__seed_data.sql`).
   - Start the HTTP server on `http://127.0.0.1:8080`.

#### Step 3: Start the React Frontend

1. Open another terminal in the root directory:
   ```powershell
   cd c:\Users\91949\OneDrive\Desktop\Coursera_Clone
   ```

2. Install dependencies (only required the first time):
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser at **[http://localhost:3000](http://localhost:3000)**.

---

### Option B: Docker Compose

If you have Docker & Docker Compose installed and prefer not to install PostgreSQL locally:

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Start PostgreSQL and the backend container:
   ```bash
   docker compose up -d
   ```

3. Start the frontend locally:
   ```bash
   cd ..
   npm install
   npm run dev
   ```

---

## 👤 Pre-Seeded Demo Accounts

The database comes pre-seeded with sample users, instructors, and courses.

All accounts use the default password: **`password123`**

| Role | Email | Password | Access / Features |
| :--- | :--- | :--- | :--- |
| **Student** | `student.demo@example.com` | `password123` | Browse courses, enroll, track lesson progress |
| **Student** | `alex.rivera@example.com` | `password123` | Student account with pre-enrolled courses |
| **Instructor** | `sarah.drasner@coursehub.dev` | `password123` | Instructor profile & course author |
| **Instructor** | `andrew.collins@coursehub.dev` | `password123` | AI & Data Science instructor |
| **Instructor** | `marcus.vance@coursehub.dev` | `password123` | Cloud & DevOps instructor |

*(You can also click **Sign Up** on the frontend to create a fresh user account.)*

---

## 📖 API Documentation & Useful Endpoints

Once the backend is running:

| Description | Method & URL |
| :--- | :--- |
| **Swagger UI** | [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html) |
| **OpenAPI JSON Spec** | `http://localhost:8080/v3/api-docs` |
| **Health Check** | `http://localhost:8080/actuator/health` |
| **Get Categories** | `GET http://localhost:8080/api/v1/categories` |
| **Popular Courses** | `GET http://localhost:8080/api/v1/courses/popular` |
| **Course Details** | `GET http://localhost:8080/api/v1/courses/{slug}` |
| **User Registration** | `POST http://localhost:8080/api/v1/auth/register` |
| **User Login** | `POST http://localhost:8080/api/v1/auth/login` |
| **Token Refresh** | `POST http://localhost:8080/api/v1/auth/refresh` |
| **User Logout** | `POST http://localhost:8080/api/v1/auth/logout` |

---

## 🔍 Common Troubleshooting

### 1. `FATAL: password authentication failed for user "postgres"`
- **Cause**: The PostgreSQL password provided doesn't match your local PostgreSQL install.
- **Fix**: Set the environment variable before starting Spring Boot:
  ```powershell
  $env:SPRING_DATASOURCE_PASSWORD="YourActualPassword"
  .\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"
  ```

### 2. `database "coursehub_db" does not exist`
- **Cause**: The PostgreSQL database hasn't been created yet.
- **Fix**: Run:
  ```powershell
  & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE coursehub_db;"
  ```

### 3. Vite Proxy Error: `ECONNREFUSED ::1:8080`
- **Cause**: Node/Vite attempted to resolve `localhost` via IPv6 (`::1`), while Spring Boot listens on IPv4 (`127.0.0.1`).
- **Fix**: The proxy target in `vite.config.ts` is configured to `http://127.0.0.1:8080`. Ensure the backend server is running.

### 4. `psql` is not recognized as an internal or external command
- **Cause**: PostgreSQL binary directory is not in your system `PATH`.
- **Fix**: Run commands with the full path:
  `"C:\Program Files\PostgreSQL\<version>\bin\psql.exe"` or add that folder to your System Environment `PATH`.

---

## 📁 Project Structure

```
Coursera_Clone/
├── backend/                              # Spring Boot Application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/coursehub/
│   │   │   │   ├── config/              # Security, CORS & Swagger config
│   │   │   │   ├── controller/          # REST API endpoints
│   │   │   │   ├── dto/                 # Request & Response DTOs
│   │   │   │   ├── entity/              # JPA entity models
│   │   │   │   ├── exception/           # Global exception handler
│   │   │   │   ├── repository/          # Spring Data JPA repositories
│   │   │   │   ├── security/            # JWT filter, UserDetailsService
│   │   │   │   └── service/             # Business logic layer
│   │   │   └── resources/
│   │   │       ├── db/migration/        # Flyway SQL migrations (V1, V2)
│   │   │       ├── application.yml      # Base configuration
│   │   │       ├── application-dev.yml  # Local dev profile (Postgres)
│   │   │       └── application-prod.yml # Production profile
│   │   └── test/                        # Unit & Integration tests
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── mvnw.cmd                         # Maven wrapper for Windows
│   └── pom.xml
│
├── src/                                 # React Frontend
│   ├── components/                      # Reusable UI components & shadcn primitives
│   ├── pages/                           # Application views (Home, Course, Auth, etc.)
│   ├── routes/                          # Route definitions & lazy-loaded split bundles
│   ├── services/                        # Axios API client & service modules
│   ├── store/                           # Zustand authentication & state stores
│   ├── types/                           # TypeScript interfaces & types
│   ├── App.tsx                          # App shell & router provider
│   └── main.tsx                         # Entry point
│
├── vite.config.ts                       # Vite configuration & dev proxy
├── tailwind.config.js                   # Tailwind CSS styling tokens
└── package.json                         # Node dependencies & scripts
```
