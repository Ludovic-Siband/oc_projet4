package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    UserRepository userRepository;

    @BeforeEach
    void cleanDatabase() {
        userRepository.deleteAll();
    }

    @Test
    @WithMockUser
    void findById_returnsUser() throws Exception {
        User saved = userRepository.save(new User("u1@example.com", "Last", "First", "pw", false));

        mockMvc.perform(get("/api/user/{id}", saved.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(saved.getId().intValue()))
                .andExpect(jsonPath("$.email").value("u1@example.com"));
    }

    @Test
    @WithMockUser(username = "u@example.com")
    void delete_isAllowedWhenAuthenticatedUserMatchesEmail() throws Exception {
        User saved = userRepository.save(new User("u@example.com", "Last", "First", "pw", false));

        mockMvc.perform(delete("/api/user/{id}", saved.getId()))
                .andExpect(status().isOk());

        assertThat(userRepository.findById(saved.getId())).isEmpty();
    }

    @Test
    @WithMockUser(username = "someone-else@example.com")
    void delete_isUnauthorizedWhenAuthenticatedUserDoesNotMatchEmail() throws Exception {
        User saved = userRepository.save(new User("u2@example.com", "Last", "First", "pw", false));

        mockMvc.perform(delete("/api/user/{id}", saved.getId()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    void findById_returnsBadRequestWhenIdNotNumeric() throws Exception {
        mockMvc.perform(get("/api/user/{id}", "abc"))
                .andExpect(status().isBadRequest());
    }
}
