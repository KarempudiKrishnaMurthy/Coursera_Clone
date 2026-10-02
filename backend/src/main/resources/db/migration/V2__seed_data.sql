-- ========================================================
-- CourseHub V2 Seed Data Migration
-- Database: PostgreSQL 16
-- Populates categories, instructors, courses, sections,
-- lessons, student enrollments, progress, and reviews.
-- ========================================================

-- 1. Seed Categories
INSERT INTO categories (id, name, icon, count) VALUES
('web-dev', 'Web Development', 'Code', 145),
('data-science', 'Data Science & AI', 'Database', 98),
('cloud-devops', 'Cloud & DevOps', 'Cloud', 76),
('design', 'UI/UX & Product Design', 'Palette', 64),
('mobile-dev', 'Mobile Development', 'Smartphone', 52),
('cybersecurity', 'Cybersecurity', 'Shield', 43),
('business', 'Business & Management', 'Briefcase', 87)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    icon = EXCLUDED.icon,
    count = EXCLUDED.count;

-- 2. Seed Users (BCrypt hash for 'password123': $2a$10$HFwcE9ixo8P6n02U9L.mQesZHicrdNSIpwcUaJCO0uv4mA5Qwz2K.)
-- Using a standard bcrypt format with 10 rounds:
INSERT INTO users (id, email, password, name, headline, bio, avatar, role, created_at, updated_at) VALUES
(1, 'sarah.drasner@coursehub.dev', '$2a$10$HFwcE9ixo8P6n02U9L.mQesZHicrdNSIpwcUaJCO0uv4mA5Qwz2K.', 'Sarah Drasner', 'Principal Engineer & Google Developer Expert', 'Sarah is an award-winning technical director and engineering leader with 15+ years experience building mission-critical web applications.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', 'INSTRUCTOR', NOW(), NOW()),
(2, 'andrew.collins@coursehub.dev', '$2a$10$HFwcE9ixo8P6n02U9L.mQesZHicrdNSIpwcUaJCO0uv4mA5Qwz2K.', 'Dr. Andrew Collins', 'Former Stanford AI Researcher & Head of Data Science', 'Dr. Collins has published over 25 papers in NeurIPS and ICML and has trained thousands of software engineers in machine learning.', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80', 'INSTRUCTOR', NOW(), NOW()),
(3, 'marcus.vance@coursehub.dev', '$2a$10$HFwcE9ixo8P6n02U9L.mQesZHicrdNSIpwcUaJCO0uv4mA5Qwz2K.', 'Marcus Vance', 'AWS Hero & Lead Infrastructure Architect', 'Marcus specializes in high-throughput cloud topologies, automated GitOps CI/CD pipelines, and FinOps cloud optimization.', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80', 'INSTRUCTOR', NOW(), NOW()),
(4, 'elena.rostova@coursehub.dev', '$2a$10$HFwcE9ixo8P6n02U9L.mQesZHicrdNSIpwcUaJCO0uv4mA5Qwz2K.', 'Elena Rostova', 'VP of Design & Former Spotify Lead Product Designer', 'Elena focuses on systems-level UX architecture, multi-brand Figma tokens, and accessible WCAG design implementations.', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80', 'INSTRUCTOR', NOW(), NOW()),
(5, 'alex.rivera@example.com', '$2a$10$HFwcE9ixo8P6n02U9L.mQesZHicrdNSIpwcUaJCO0uv4mA5Qwz2K.', 'Alex Rivera', 'Aspiring Full-Stack Software Engineer', 'Learning modern web development and distributed systems on CourseHub.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'STUDENT', NOW(), NOW()),
(6, 'student.demo@example.com', '$2a$10$HFwcE9ixo8P6n02U9L.mQesZHicrdNSIpwcUaJCO0uv4mA5Qwz2K.', 'Demo Student', 'Lifelong Learner', 'Exploring computer science and cloud technologies.', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', 'STUDENT', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 3. Seed Instructors
INSERT INTO instructors (id, user_id, name, headline, avatar, bio, rating, students_count, courses_count) VALUES
(1, 1, 'Sarah Drasner', 'Principal Engineer & Google Developer Expert', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', 'Sarah is an award-winning technical director and engineering leader with 15+ years experience building mission-critical web applications.', 4.9, 89400, 5),
(2, 2, 'Dr. Andrew Collins', 'Former Stanford AI Researcher & Head of Data Science', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80', 'Dr. Collins has published over 25 papers in NeurIPS and ICML and has trained thousands of software engineers in machine learning.', 4.8, 142000, 4),
(3, 3, 'Marcus Vance', 'AWS Hero & Lead Infrastructure Architect', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80', 'Marcus specializes in high-throughput cloud topologies, automated GitOps CI/CD pipelines, and FinOps cloud optimization.', 4.9, 67200, 3),
(4, 4, 'Elena Rostova', 'VP of Design & Former Spotify Lead Product Designer', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80', 'Elena focuses on systems-level UX architecture, multi-brand Figma tokens, and accessible WCAG design implementations.', 4.7, 45100, 2)
ON CONFLICT (id) DO NOTHING;

SELECT setval('instructors_id_seq', (SELECT MAX(id) FROM instructors));

-- 4. Seed Courses (8 courses covering all categories, levels, and price points)
INSERT INTO courses (
    id, slug, title, subtitle, description, category_id, level, price, original_price,
    rating, ratings_count, students_count, language, last_updated, thumbnail, preview_video_url,
    instructor_id, is_bestseller, is_featured, created_at, updated_at
) VALUES
(
    'course-1',
    'fullstack-react-typescript-masterclass',
    'Full-Stack React & TypeScript: Production Masterclass',
    'Build high-performance, enterprise-grade applications with React 18, TypeScript, Tailwind CSS, and Next.js.',
    'Master full-stack modern React development from the ground up. You will learn modern React architectures, server components, Zustand state management, API integration, and clean code principles. Built for engineers seeking senior-level fluency.',
    'web-dev',
    'intermediate',
    69.99,
    129.99,
    4.9,
    3820,
    24150,
    'English',
    'September 2024',
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    1,
    TRUE,
    TRUE,
    NOW(),
    NOW()
),
(
    'course-2',
    'machine-learning-deep-learning-python',
    'Machine Learning & Deep Learning with Python',
    'Complete AI engineering bootcamp: Scikit-learn, TensorFlow, PyTorch, LLMs, and real-world ML pipelines.',
    'Transform your career with hands-on machine learning. From statistical exploratory data analysis to training transformer models, this comprehensive specialization equips you with production-ready AI skills.',
    'data-science',
    'all',
    84.99,
    149.99,
    4.8,
    5210,
    38900,
    'English',
    'August 2024',
    'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&auto=format&fit=crop&q=80',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    2,
    TRUE,
    TRUE,
    NOW(),
    NOW()
),
(
    'course-3',
    'aws-certified-cloud-architect-mastery',
    'AWS Certified Solutions Architect & DevOps Mastery',
    'Pass SAA-C03 and master Terraform, Kubernetes, ECS, serverless Lambda, and production cloud operations.',
    'Become an industry-leading cloud architect. Designed for engineers preparing for AWS certifications or looking to design highly available, fault-tolerant infrastructure in modern cloud environments.',
    'cloud-devops',
    'advanced',
    79.99,
    139.99,
    4.9,
    2940,
    19800,
    'English',
    'July 2024',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    NULL,
    3,
    TRUE,
    FALSE,
    NOW(),
    NOW()
),
(
    'course-4',
    'ui-ux-design-systems-figma-pro',
    'UI/UX Design Systems & High-Fidelity Prototyping',
    'From research to production design tokens: Master Figma, typography scales, accessibility, and micro-interactions.',
    'Bridge the gap between design and engineering. Learn how top tech companies build design systems that scale across iOS, Android, and Web platforms while maintaining pristine visual hierarchy.',
    'design',
    'beginner',
    54.99,
    99.99,
    4.7,
    1840,
    14200,
    'English',
    'September 2024',
    'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
    NULL,
    4,
    FALSE,
    TRUE,
    NOW(),
    NOW()
),
(
    'course-5',
    'react-native-cross-platform-apps',
    'React Native & Expo: iOS and Android from Scratch',
    'Build native mobile apps with JavaScript. Learn gestures, native animations, offline sync, and App Store distribution.',
    'Ship real native applications to millions of mobile users. Write once in TypeScript and deploy smooth 60fps applications to Apple App Store and Google Play Store.',
    'mobile-dev',
    'intermediate',
    59.99,
    109.99,
    4.8,
    2150,
    16700,
    'English',
    'June 2024',
    'https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=800&auto=format&fit=crop&q=80',
    NULL,
    1,
    FALSE,
    FALSE,
    NOW(),
    NOW()
),
(
    'course-6',
    'zero-to-hero-ethical-hacking',
    'Zero-to-Hero Ethical Hacking & Network Defense',
    'Practical offensive security: Kali Linux, Wireshark, Metasploit, web vulnerabilities (OWASP Top 10), and reporting.',
    'Learn how attackers think to defend critical digital infrastructure. Real lab scenarios covering penetration testing, vulnerability scanning, and security engineering protocols.',
    'cybersecurity',
    'all',
    49.99,
    89.99,
    4.9,
    4320,
    31200,
    'English',
    'August 2024',
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
    NULL,
    3,
    TRUE,
    TRUE,
    NOW(),
    NOW()
),
(
    'course-7',
    'product-management-accelerator',
    'Product Management Accelerator: From Idea to Scale',
    'Master user research, roadmap prioritization, PRDs, agile sprint rituals, metric modeling, and go-to-market strategies.',
    'Step into high-impact product leadership roles. Learn the frameworks used by PMs at Stripe, Airbnb, and Google to discover customer problems and build products customers love.',
    'business',
    'beginner',
    44.99,
    79.99,
    4.6,
    1120,
    9500,
    'English',
    'May 2024',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80',
    NULL,
    2,
    FALSE,
    FALSE,
    NOW(),
    NOW()
),
(
    'course-8',
    'nextjs-tailwind-ecommerce-platform',
    'Next.js 14 Enterprise Architecture & Server Actions',
    'Free Community Workshop: Server Components, streaming SSR, PostgreSQL caching, and Stripe payments.',
    'A completely free hands-on course covering full-stack Next.js app router architecture, server actions, and end-to-end type safety.',
    'web-dev',
    'advanced',
    0.00,
    49.99,
    4.8,
    980,
    8400,
    'English',
    'September 2024',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
    NULL,
    1,
    FALSE,
    FALSE,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Course Learning Points
INSERT INTO course_learning_points (course_id, point, sort_order) VALUES
('course-1', 'Architect robust React 18 frontend architectures using TypeScript and clean patterns', 1),
('course-1', 'Manage complex application state predictably with Zustand and React Context', 2),
('course-1', 'Optimize re-renders, bundle sizes, and performance profiles with modern profiling tools', 3),
('course-1', 'Design responsive, accessible user interfaces with Tailwind CSS and Headless UI', 4),
('course-1', 'Implement real-time features and resilient error boundaries in production apps', 5),

('course-2', 'Build and deploy machine learning models using Scikit-Learn and PyTorch', 1),
('course-2', 'Perform deep exploratory data analysis and feature engineering on big data', 2),
('course-2', 'Fine-tune modern Transformer models and LLMs for domain-specific tasks', 3),
('course-2', 'Serve models via high-throughput FastAPI microservices and Docker containers', 4),

('course-6', 'Conduct professional web application penetration tests against OWASP Top 10 vulnerabilities', 1),
('course-6', 'Analyze network traffic with Wireshark and identify malicious packet signatures', 2),
('course-6', 'Implement defensive hardening for Linux and Windows enterprise systems', 3)
ON CONFLICT DO NOTHING;

-- 6. Seed Course Requirements
INSERT INTO course_requirements (course_id, requirement, sort_order) VALUES
('course-1', 'Basic knowledge of JavaScript (ES6+)', 1),
('course-1', 'Familiarity with HTML and CSS fundamentals', 2),
('course-1', 'A computer with Node.js installed and an editor like VS Code', 3),

('course-2', 'Comfortable writing basic Python code and functions', 1),
('course-2', 'High-school level linear algebra and calculus basics', 2),

('course-6', 'Basic understanding of computer networking (TCP/IP, DNS, HTTP)', 1),
('course-6', 'Willingness to learn and ethical mindset', 2)
ON CONFLICT DO NOTHING;

-- 7. Seed Course Sections
INSERT INTO course_sections (id, course_id, title, sort_order) VALUES
('sec-1', 'course-1', 'Module 1: Foundations & Architecture Setup', 1),
('sec-2', 'course-1', 'Module 2: Advanced React Patterns & Custom Hooks', 2),
('sec-3', 'course-1', 'Module 3: Global State & Network Resiliency', 3),
('sec-4', 'course-1', 'Module 4: Production Deployment & CI/CD', 4),

('sec-2-1', 'course-2', 'Module 1: Python Data Science Ecosystem & EDA', 1),
('sec-2-2', 'course-2', 'Module 2: Supervised & Unsupervised Learning', 2),
('sec-2-3', 'course-2', 'Module 3: Neural Networks with PyTorch', 3),

('sec-6-1', 'course-6', 'Module 1: Security Lab Setup & Linux Fundamentals', 1),
('sec-6-2', 'course-6', 'Module 2: Network Reconnaissance & Port Scanning', 2),
('sec-6-3', 'course-6', 'Module 3: Web Application Exploitation (OWASP)', 3)
ON CONFLICT (id) DO NOTHING;

-- 8. Seed Lessons
INSERT INTO lessons (id, section_id, title, duration, video_url, is_free_preview, sort_order) VALUES
-- course-1 lessons
('les-1-1', 'sec-1', 'Course Overview & Mental Models', '08:35', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', TRUE, 1),
('les-1-2', 'sec-1', 'TypeScript Fundamentals for React Developers', '14:20', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', TRUE, 2),
('les-1-3', 'sec-1', 'Configuring Vite, Tailwind & Path Aliases', '12:15', NULL, FALSE, 3),

('les-2-1', 'sec-2', 'Compound Components & Slots Pattern', '18:40', NULL, TRUE, 1),
('les-2-2', 'sec-2', 'State Machines & Custom Hook Extraction', '22:10', NULL, FALSE, 2),
('les-2-3', 'sec-2', 'Concurrent Rendering & useTransition', '15:30', NULL, FALSE, 3),

('les-3-1', 'sec-3', 'Why Zustand: Architecture & Slices', '16:50', NULL, FALSE, 1),
('les-3-2', 'sec-3', 'Axios Interceptors & Offline Caching', '20:15', NULL, FALSE, 2),
('les-3-3', 'sec-3', 'Form Handling with React Hook Form & Zod', '24:00', NULL, FALSE, 3),

('les-4-1', 'sec-4', 'Optimizing Bundle Splitting & Dynamic Imports', '11:45', NULL, FALSE, 1),
('les-4-2', 'sec-4', 'Dockerizing the Client & Automated Testing', '19:30', NULL, FALSE, 2),

-- course-2 lessons
('les-2-1-1', 'sec-2-1', 'NumPy & Pandas High-Performance Vectorization', '25:10', NULL, TRUE, 1),
('les-2-1-2', 'sec-2-1', 'Data Cleaning and Outlier Detection', '18:30', NULL, FALSE, 2),
('les-2-2-1', 'sec-2-2', 'Regression Algorithms & Gradient Descent', '32:00', NULL, FALSE, 1),
('les-2-2-2', 'sec-2-2', 'Tree Models: Random Forest & XGBoost', '28:40', NULL, FALSE, 2),
('les-2-3-1', 'sec-2-3', 'Building Tensors & Autograd Mechanics', '35:15', NULL, FALSE, 1),

-- course-6 lessons
('les-6-1-1', 'sec-6-1', 'VirtualBox & Kali Linux Penetration Testing Lab', '21:10', NULL, TRUE, 1),
('les-6-1-2', 'sec-6-1', 'Essential Bash Commands for Hackers', '17:40', NULL, FALSE, 2),
('les-6-2-1', 'sec-6-2', 'Nmap Discovery Scanning & Port Analysis', '29:00', NULL, FALSE, 1),
('les-6-3-1', 'sec-6-3', 'SQL Injection (SQLi) & Cross-Site Scripting (XSS)', '34:20', NULL, FALSE, 1)
ON CONFLICT (id) DO NOTHING;

-- 9. Seed Student Enrollments for Alex Rivera (User ID 5)
INSERT INTO enrollments (id, user_id, course_id, progress_percent, last_accessed_lesson_id, last_accessed_at, enrolled_at) VALUES
(1, 5, 'course-1', 35, 'les-1-3', NOW() - INTERVAL '1 day', NOW() - INTERVAL '14 days'),
(2, 5, 'course-6', 50, 'les-6-1-2', NOW() - INTERVAL '3 days', NOW() - INTERVAL '7 days')
ON CONFLICT (user_id, course_id) DO NOTHING;

SELECT setval('enrollments_id_seq', (SELECT MAX(id) FROM enrollments));

-- 10. Seed Enrollment Progress (Completed Lessons)
INSERT INTO enrollment_progress (enrollment_id, lesson_id, completed_at) VALUES
(1, 'les-1-1', NOW() - INTERVAL '10 days'),
(1, 'les-1-2', NOW() - INTERVAL '5 days'),
(2, 'les-6-1-1', NOW() - INTERVAL '4 days')
ON CONFLICT (enrollment_id, lesson_id) DO NOTHING;

-- 11. Seed User Enrolled Course IDs Cache for Alex Rivera
INSERT INTO user_enrolled_course_ids (user_id, course_id) VALUES
(5, 'course-1'),
(5, 'course-6')
ON CONFLICT (user_id, course_id) DO NOTHING;

-- 12. Seed Reviews
INSERT INTO reviews (course_id, user_id, user_name, user_avatar, rating, comment, created_at) VALUES
('course-1', 5, 'Alex Rivera', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 5, 'This course completely revamped how our team structures React projects. Sarah explains advanced architectural concepts with crystal clarity.', NOW() - INTERVAL '12 days'),
('course-1', 6, 'Marcus Brody', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', 5, 'The TypeScript and state management modules alone are worth ten times the price. Production-level code examples throughout.', NOW() - INTERVAL '20 days'),
('course-2', 5, 'Alex Rivera', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 5, 'Dr. Collins connects theoretical ML mathematics with practical PyTorch pipelines seamlessly. Superb exercises.', NOW() - INTERVAL '6 days'),
('course-6', 6, 'Jordan Hayes', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', 5, 'Outstanding practical ethical hacking lab. Everything works as demonstrated, and the security explanations are top-tier.', NOW() - INTERVAL '15 days')
ON CONFLICT DO NOTHING;
