package com.openclassrooms.starterjwt.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.payload.request.SignupRequest;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

        @Autowired
        MockMvc mockMvc;

        @Autowired
        ObjectMapper objectMapper;

        @Autowired
        UserRepository userRepository;

        @BeforeEach
        void cleanDatabase() {
                userRepository.deleteAll();
        }

        @Test
        void register_persistsUser() throws Exception {
                SignupRequest signup = new SignupRequest();
                signup.setEmail("new@example.com");
                signup.setFirstName("First");
                signup.setLastName("Last");
                signup.setPassword("password");

                mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(signup)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.message").value("User registered successfully!"));

                assertThat(userRepository.existsByEmail("new@example.com")).isTrue();
        }

        @Test
        void register_duplicateEmail_returnsBadRequestWithMessage() throws Exception {
                SignupRequest signup = new SignupRequest();
                signup.setEmail("dup@example.com");
                signup.setFirstName("First");
                signup.setLastName("Last");
                signup.setPassword("password");

                mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(signup)))
                                .andExpect(status().isOk());

                mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(signup)))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.message").value("Error: Email is already taken!"));
        }

        @Test
        void login_returnsJwtResponse() throws Exception {
                SignupRequest signup = new SignupRequest();
                signup.setEmail("login@example.com");
                signup.setFirstName("First");
                signup.setLastName("Last");
                signup.setPassword("password");

                mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(signup)))
                                .andExpect(status().isOk());

                LoginRequest login = new LoginRequest();
                login.setEmail("login@example.com");
                login.setPassword("password");

                mockMvc.perform(post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(login)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.token").isNotEmpty())
                                .andExpect(jsonPath("$.type").value("Bearer"))
                                .andExpect(jsonPath("$.username").value("login@example.com"))
                                .andExpect(jsonPath("$.firstName").value("First"))
                                .andExpect(jsonPath("$.lastName").value("Last"))
                                .andExpect(jsonPath("$.admin").value(false));
        }
}
