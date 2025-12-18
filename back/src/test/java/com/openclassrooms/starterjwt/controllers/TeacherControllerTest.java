package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TeacherControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    TeacherRepository teacherRepository;

    @Test
    @WithMockUser
    void findAll_returnsTeachers() throws Exception {
        teacherRepository.saveAll(List.of(
                Teacher.builder().firstName("Ada").lastName("Lovelace").build(),
                Teacher.builder().firstName("Alan").lastName("Turing").build()));

        mockMvc.perform(get("/api/teacher"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").isNumber())
                .andExpect(jsonPath("$[0].firstName").isNotEmpty())
                .andExpect(jsonPath("$[0].lastName").isNotEmpty());
    }

    @Test
    @WithMockUser
    void findById_returnsTeacher() throws Exception {
        Teacher saved = teacherRepository.save(Teacher.builder().firstName("Ada").lastName("Lovelace").build());

        mockMvc.perform(get("/api/teacher/{id}", saved.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(saved.getId().intValue()))
                .andExpect(jsonPath("$.firstName").value("Ada"))
                .andExpect(jsonPath("$.lastName").value("Lovelace"));
    }

    @Test
    @WithMockUser
    void findById_returnsNotFoundWhenMissing() throws Exception {
        mockMvc.perform(get("/api/teacher/{id}", 99999))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void findById_returnsBadRequestWhenIdNotNumeric() throws Exception {
        mockMvc.perform(get("/api/teacher/{id}", "abc"))
                .andExpect(status().isBadRequest());
    }
}
