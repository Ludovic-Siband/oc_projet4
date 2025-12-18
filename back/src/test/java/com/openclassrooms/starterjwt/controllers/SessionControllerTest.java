package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SessionControllerTest {

        @Autowired
        MockMvc mockMvc;

        @Autowired
        SessionRepository sessionRepository;

        @Autowired
        TeacherRepository teacherRepository;

        @Autowired
        UserRepository userRepository;

        @BeforeEach
        void cleanDatabase() {
                sessionRepository.deleteAll();
                userRepository.deleteAll();
                teacherRepository.deleteAll();
        }

        @Test
        @WithMockUser
        void findAll_returnsSessions() throws Exception {
                Teacher teacher = teacherRepository
                                .save(Teacher.builder().firstName("Ada").lastName("Lovelace").build());
                sessionRepository.save(Session.builder()
                                .name("Morning yoga")
                                .description("Relax")
                                .date(new Date())
                                .teacher(teacher)
                                .users(new ArrayList<>())
                                .build());

                mockMvc.perform(get("/api/session"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$[0].id").isNumber())
                                .andExpect(jsonPath("$[0].name").value("Morning yoga"))
                                .andExpect(jsonPath("$[0].teacher_id").value(teacher.getId().intValue()));
        }

        @Test
        @WithMockUser
        void findById_returnsSession() throws Exception {
                Teacher teacher = teacherRepository
                                .save(Teacher.builder().firstName("Ada").lastName("Lovelace").build());
                User user = userRepository.save(new User("u1@example.com", "Last", "First", "pw", false));
                Session saved = sessionRepository.save(Session.builder()
                                .name("Morning yoga")
                                .description("Relax")
                                .date(new Date())
                                .teacher(teacher)
                                .users(new ArrayList<>(List.of(user)))
                                .build());

                mockMvc.perform(get("/api/session/{id}", saved.getId()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value(saved.getId().intValue()))
                                .andExpect(jsonPath("$.teacher_id").value(teacher.getId().intValue()))
                                .andExpect(jsonPath("$.users[0]").value(user.getId().intValue()));
        }

        @Test
        @WithMockUser
        void participate_addsUserAndBadRequestOnDuplicate() throws Exception {
                Teacher teacher = teacherRepository
                                .save(Teacher.builder().firstName("Ada").lastName("Lovelace").build());
                User user = userRepository.save(new User("u2@example.com", "Last", "First", "pw", false));
                Session saved = sessionRepository.save(Session.builder()
                                .name("Morning yoga")
                                .description("Relax")
                                .date(new Date())
                                .teacher(teacher)
                                .users(new ArrayList<>())
                                .build());

                mockMvc.perform(post("/api/session/{id}/participate/{userId}", saved.getId(), user.getId()))
                                .andExpect(status().isOk());

                Session afterFirst = sessionRepository.findById(saved.getId()).orElseThrow();
                assertThat(afterFirst.getUsers()).extracting(User::getId).containsExactly(user.getId());

                mockMvc.perform(post("/api/session/{id}/participate/{userId}", saved.getId(), user.getId()))
                                .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser
        void noLongerParticipate_removesUserAndBadRequestWhenMissing() throws Exception {
                Teacher teacher = teacherRepository
                                .save(Teacher.builder().firstName("Ada").lastName("Lovelace").build());
                User user = userRepository.save(new User("u3@example.com", "Last", "First", "pw", false));
                Session saved = sessionRepository.save(Session.builder()
                                .name("Morning yoga")
                                .description("Relax")
                                .date(new Date())
                                .teacher(teacher)
                                .users(new ArrayList<>(List.of(user)))
                                .build());

                mockMvc.perform(delete("/api/session/{id}/participate/{userId}", saved.getId(), user.getId()))
                                .andExpect(status().isOk());

                Session afterDelete = sessionRepository.findById(saved.getId()).orElseThrow();
                assertThat(afterDelete.getUsers()).isEmpty();

                mockMvc.perform(delete("/api/session/{id}/participate/{userId}", saved.getId(), user.getId()))
                                .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser
        void delete_removesSession() throws Exception {
                Teacher teacher = teacherRepository
                                .save(Teacher.builder().firstName("Ada").lastName("Lovelace").build());
                Session saved = sessionRepository.save(Session.builder()
                                .name("Morning yoga")
                                .description("Relax")
                                .date(new Date())
                                .teacher(teacher)
                                .users(new ArrayList<>())
                                .build());

                mockMvc.perform(delete("/api/session/{id}", saved.getId()))
                                .andExpect(status().isOk());

                assertThat(sessionRepository.findById(saved.getId())).isEmpty();
        }
}
