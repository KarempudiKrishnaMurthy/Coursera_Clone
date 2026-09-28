package com.coursehub.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CourseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldReturnCoursesWithPagination() throws Exception {
        mockMvc.perform(get("/api/v1/courses")
                        .param("page", "1")
                        .param("limit", "9")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.total", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.totalPages", greaterThanOrEqualTo(1)));
    }

    @Test
    void shouldFilterCoursesByCategory() throws Exception {
        mockMvc.perform(get("/api/v1/courses")
                        .param("category", "web-dev")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.items[0].category").value("web-dev"));
    }

    @Test
    void shouldReturnPopularCourses() throws Exception {
        mockMvc.perform(get("/api/v1/courses/popular")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$[0].title").exists());
    }

    @Test
    void shouldReturnCourseBySlug() throws Exception {
        mockMvc.perform(get("/api/v1/courses/slug/fullstack-react-typescript-masterclass")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value("fullstack-react-typescript-masterclass"))
                .andExpect(jsonPath("$.sections").isArray())
                .andExpect(jsonPath("$.whatYouWillLearn").isArray());
    }

    @Test
    void shouldReturn404ForNonExistentSlug() throws Exception {
        mockMvc.perform(get("/api/v1/courses/slug/does-not-exist-at-all")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"));
    }
}
