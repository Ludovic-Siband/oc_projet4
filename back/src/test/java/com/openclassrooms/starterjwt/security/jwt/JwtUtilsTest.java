package com.openclassrooms.starterjwt.security.jwt;

import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class JwtUtilsTest {

    private static final String VALID_SECRET =
            "this-is-a-very-long-test-secret-that-is-at-least-64-bytes-long-1234567890";

    @Test
    void generateAndValidateToken_roundTripUsername() {
        JwtUtils jwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", VALID_SECRET);
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", 60000);

        UserDetailsImpl principal = UserDetailsImpl.builder()
                .id(1L)
                .username("user@example.com")
                .firstName("First")
                .lastName("Last")
                .password("pw")
                .build();

        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(principal);

        String token = jwtUtils.generateJwtToken(authentication);

        assertAll(
                () -> assertTrue(jwtUtils.validateJwtToken(token)),
                () -> assertEquals("user@example.com", jwtUtils.getUserNameFromJwtToken(token)));
    }

    @Test
    void validateJwtToken_returnsFalseForInvalidTokens() {
        JwtUtils jwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", VALID_SECRET);
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", 60000);

        List<Boolean> validations = List.of(
                jwtUtils.validateJwtToken("not-a-jwt"),
                jwtUtils.validateJwtToken(""),
                jwtUtils.validateJwtToken("Bearer token"));

        assertThat(validations).containsExactly(false, false, false);
    }

    @Test
    void validateJwtToken_returnsFalseForExpiredToken() {
        JwtUtils jwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", VALID_SECRET);
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", -1000);

        UserDetailsImpl principal = UserDetailsImpl.builder()
                .id(1L)
                .username("user@example.com")
                .firstName("First")
                .lastName("Last")
                .password("pw")
                .build();

        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(principal);

        String token = jwtUtils.generateJwtToken(authentication);

        assertThat(jwtUtils.validateJwtToken(token)).isFalse();
    }

    @Test
    void validateJwtToken_returnsFalseForInvalidSignature() {
        JwtUtils signer = new JwtUtils();
        ReflectionTestUtils.setField(signer, "jwtSecret",
                "this-is-another-very-long-test-secret-that-is-at-least-64-bytes-long-ABCDEFGHIJ");
        ReflectionTestUtils.setField(signer, "jwtExpirationMs", 60000);

        JwtUtils validator = new JwtUtils();
        ReflectionTestUtils.setField(validator, "jwtSecret", VALID_SECRET);
        ReflectionTestUtils.setField(validator, "jwtExpirationMs", 60000);

        UserDetailsImpl principal = UserDetailsImpl.builder()
                .id(1L)
                .username("user@example.com")
                .firstName("First")
                .lastName("Last")
                .password("pw")
                .build();

        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(principal);

        String token = signer.generateJwtToken(authentication);

        assertThat(validator.validateJwtToken(token)).isFalse();
    }
}
