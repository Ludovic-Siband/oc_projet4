package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.payload.request.SignupRequest;
import com.openclassrooms.starterjwt.payload.response.JwtResponse;
import com.openclassrooms.starterjwt.payload.response.MessageResponse;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.security.jwt.JwtUtils;
import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    AuthenticationManager authenticationManager;

    @Mock
    JwtUtils jwtUtils;

    @Mock
    PasswordEncoder passwordEncoder;

    @Mock
    UserRepository userRepository;

    @InjectMocks
    AuthService authService;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void authenticateUser_setsSecurityContextAndReturnsAdminTrue() {
        LoginRequest request = new LoginRequest();
        request.setEmail("admin@example.com");
        request.setPassword("pw");

        UserDetailsImpl principal = UserDetailsImpl.builder()
                .id(42L)
                .username("admin@example.com")
                .firstName("Ada")
                .lastName("Lovelace")
                .password("encoded")
                .build();

        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(principal);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn("jwt");
        when(userRepository.findByEmail("admin@example.com"))
                .thenReturn(Optional.of(new User("admin@example.com", "Lovelace", "Ada", "encoded", true)));

        JwtResponse response = authService.authenticateUser(request);

        assertAll(
                () -> assertSame(authentication, SecurityContextHolder.getContext().getAuthentication()),
                () -> assertEquals("jwt", response.getToken()),
                () -> assertEquals(42L, response.getId()),
                () -> assertEquals("admin@example.com", response.getUsername()),
                () -> assertEquals("Ada", response.getFirstName()),
                () -> assertEquals("Lovelace", response.getLastName()),
                () -> assertEquals(true, response.getAdmin()));
    }

    @Test
    void authenticateUser_returnsAdminFalseWhenUserNotFound() {
        LoginRequest request = new LoginRequest();
        request.setEmail("missing@example.com");
        request.setPassword("pw");

        UserDetailsImpl principal = UserDetailsImpl.builder()
                .id(1L)
                .username("missing@example.com")
                .firstName("First")
                .lastName("Last")
                .password("encoded")
                .build();

        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(principal);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn("jwt");
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        JwtResponse response = authService.authenticateUser(request);

        assertFalse(response.getAdmin());
    }

    @Test
    void registerUser_throwsWhenEmailAlreadyTaken() {
        SignupRequest request = new SignupRequest();
        request.setEmail("taken@example.com");
        request.setFirstName("First");
        request.setLastName("Last");
        request.setPassword("pw");

        when(userRepository.existsByEmail("taken@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.registerUser(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Email is already taken");
    }

    @Test
    void registerUser_savesEncodedPasswordAndReturnsMessage() {
        SignupRequest request = new SignupRequest();
        request.setEmail("new@example.com");
        request.setFirstName("First");
        request.setLastName("Last");
        request.setPassword("pw");

        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("pw")).thenReturn("encoded");

        MessageResponse response = authService.registerUser(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User saved = userCaptor.getValue();

        assertAll(
                () -> assertEquals("new@example.com", saved.getEmail()),
                () -> assertEquals("First", saved.getFirstName()),
                () -> assertEquals("Last", saved.getLastName()),
                () -> assertEquals("encoded", saved.getPassword()),
                () -> assertFalse(saved.isAdmin()),
                () -> assertEquals("User registered successfully!", response.getMessage()));
    }
}
