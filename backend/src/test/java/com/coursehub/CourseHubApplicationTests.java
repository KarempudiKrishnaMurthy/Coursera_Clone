package com.coursehub;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class CourseHubApplicationTests {

    @Test
    void contextLoads() {
        // Verifies Spring application context boots successfully
    }
}
