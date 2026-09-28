package com.coursehub.config;

import com.coursehub.entity.*;
import com.coursehub.repository.CategoryRepository;
import com.coursehub.repository.CourseRepository;
import com.coursehub.repository.InstructorRepository;
import com.coursehub.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;
    private final InstructorRepository instructorRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            CourseRepository courseRepository,
            CategoryRepository categoryRepository,
            InstructorRepository instructorRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.courseRepository = courseRepository;
        this.categoryRepository = categoryRepository;
        this.instructorRepository = instructorRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedCategories();
        seedUsersAndInstructors();
        seedCourses();
    }

    private void seedCategories() {
        if (categoryRepository.count() > 0) return;

        categoryRepository.saveAll(List.of(
                new Category("web-dev", "Web Development", "Code", 145),
                new Category("data-science", "Data Science & AI", "Database", 98),
                new Category("cloud-devops", "Cloud & DevOps", "Cloud", 76),
                new Category("design", "UI/UX & Product Design", "Palette", 64),
                new Category("mobile-dev", "Mobile Development", "Smartphone", 52),
                new Category("cybersecurity", "Cybersecurity", "Shield", 43),
                new Category("business", "Business & Management", "Briefcase", 87)
        ));
        log.info("Initialized default categories");
    }

    private void seedUsersAndInstructors() {
        if (instructorRepository.count() > 0) return;

        // Create instructor user
        User instUser = new User("sarah.drasner@coursehub.dev", passwordEncoder.encode("password123"), "Sarah Drasner", Role.INSTRUCTOR);
        instUser.setHeadline("Principal Engineer & Google Developer Expert");
        instUser.setAvatar("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80");
        instUser.setBio("Award-winning technical director and engineering leader with 15+ years experience building mission-critical web applications.");
        userRepository.save(instUser);

        Instructor instructor = new Instructor(
                "Sarah Drasner",
                "Principal Engineer & Google Developer Expert",
                "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
                "Award-winning technical director and engineering leader with 15+ years experience building mission-critical web applications.",
                BigDecimal.valueOf(4.9),
                89400,
                5
        );
        instructor.setUser(instUser);
        instructorRepository.save(instructor);

        // Create Andrew Collins
        Instructor inst2 = new Instructor(
                "Dr. Andrew Collins",
                "Former Stanford AI Researcher & Head of Data Science",
                "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80",
                "Dr. Collins has published over 25 papers in NeurIPS and ICML. He has trained thousands of software engineers in machine learning.",
                BigDecimal.valueOf(4.8),
                142000,
                4
        );
        instructorRepository.save(inst2);
    }

    private void seedCourses() {
        if (courseRepository.count() > 0) return;

        Category webDev = categoryRepository.findById("web-dev").orElse(null);
        Category dataScience = categoryRepository.findById("data-science").orElse(null);
        Instructor sarah = instructorRepository.findAll().stream().filter(i -> i.getName().contains("Sarah")).findFirst().orElse(null);
        Instructor andrew = instructorRepository.findAll().stream().filter(i -> i.getName().contains("Andrew")).findFirst().orElse(null);

        // Course 1: React & TS Masterclass
        Course c1 = new Course(
                "course-1",
                "fullstack-react-typescript-masterclass",
                "Full-Stack React & TypeScript: Production Masterclass",
                "Build high-performance, enterprise-grade applications with React 18, TypeScript, Tailwind CSS, and Next.js.",
                "Master full-stack modern React development from the ground up. You will learn modern React architectures, server components, Zustand state management, API integration, and clean code principles.",
                webDev,
                "intermediate",
                BigDecimal.valueOf(69.99),
                BigDecimal.valueOf(129.99),
                BigDecimal.valueOf(4.9),
                3820,
                24150,
                "English",
                "September 2024",
                "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80",
                sarah,
                true,
                true
        );
        c1.setWhatYouWillLearn(List.of(
                "Architect robust React 18 frontend architectures using TypeScript and clean patterns",
                "Manage complex application state predictably with Zustand and React Context",
                "Optimize re-renders, bundle sizes, and performance profiles with modern profiling tools"
        ));
        c1.setRequirements(List.of(
                "Basic knowledge of JavaScript (ES6+)",
                "Familiarity with HTML and CSS fundamentals"
        ));

        CourseSection s1 = new CourseSection("sec-1", "Module 1: Foundations & Architecture Setup", 1);
        s1.addLesson(new SectionLesson("les-1-1", "Course Overview & Mental Models", "08:35", true, 1));
        s1.addLesson(new SectionLesson("les-1-2", "TypeScript Fundamentals for React Developers", "14:20", true, 2));
        s1.addLesson(new SectionLesson("les-1-3", "Configuring Vite, Tailwind & Path Aliases", "12:15", false, 3));
        c1.addSection(s1);

        CourseSection s2 = new CourseSection("sec-2", "Module 2: Advanced React Patterns", 2);
        s2.addLesson(new SectionLesson("les-2-1", "Compound Components & Slots", "18:40", true, 1));
        s2.addLesson(new SectionLesson("les-2-2", "State Machines & Custom Hook Extraction", "22:10", false, 2));
        c1.addSection(s2);

        courseRepository.save(c1);

        // Course 2: Machine Learning
        Course c2 = new Course(
                "course-2",
                "machine-learning-deep-learning-python",
                "Machine Learning & Deep Learning with Python",
                "Complete AI engineering bootcamp: Scikit-learn, TensorFlow, PyTorch, LLMs, and real-world ML pipelines.",
                "Transform your career with hands-on machine learning. From statistical exploratory data analysis to training transformer models, this comprehensive specialization equips you with production-ready AI skills.",
                dataScience,
                "all",
                BigDecimal.valueOf(84.99),
                BigDecimal.valueOf(149.99),
                BigDecimal.valueOf(4.8),
                5210,
                38900,
                "English",
                "August 2024",
                "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&auto=format&fit=crop&q=80",
                andrew,
                true,
                true
        );
        c2.setWhatYouWillLearn(List.of(
                "Build predictive models using Linear Regression, Random Forests, and XGBoost",
                "Train deep neural networks with PyTorch and TensorFlow for computer vision & NLP"
        ));
        c2.setRequirements(List.of(
                "Basic programming knowledge in Python",
                "High school level math"
        ));

        CourseSection s21 = new CourseSection("sec-2-1", "Module 1: Machine Learning Core Mathematics", 1);
        s21.addLesson(new SectionLesson("les-2-1-1", "Data Preprocessing & NumPy Accelerations", "19:40", true, 1));
        c2.addSection(s21);

        courseRepository.save(c2);

        log.info("Initialized default seed courses");
    }
}
