package com.openclassrooms.starterjwt.security.jwt;

import com.openclassrooms.starterjwt.security.services.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthTokenFilterTest {

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void doFilter_setsAuthenticationWhenJwtIsValid() throws Exception {
        JwtUtils jwtUtils = mock(JwtUtils.class);
        UserDetailsServiceImpl userDetailsService = mock(UserDetailsServiceImpl.class);

        AuthTokenFilter filter = new AuthTokenFilter();
        ReflectionTestUtils.setField(filter, "jwtUtils", jwtUtils);
        ReflectionTestUtils.setField(filter, "userDetailsService", userDetailsService);

        when(jwtUtils.validateJwtToken("token")).thenReturn(true);
        when(jwtUtils.getUserNameFromJwtToken("token")).thenReturn("user@example.com");

        UserDetails userDetails = User.withUsername("user@example.com").password("pw").authorities("USER").build();
        when(userDetailsService.loadUserByUsername("user@example.com")).thenReturn(userDetails);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        assertAll(
                () -> assertNotNull(SecurityContextHolder.getContext().getAuthentication()),
                () -> assertEquals("user@example.com", SecurityContextHolder.getContext().getAuthentication().getName()));
        verify(chain).doFilter(request, response);
    }

    @Test
    void doFilter_doesNothingWhenNoBearerHeader() throws Exception {
        JwtUtils jwtUtils = mock(JwtUtils.class);
        UserDetailsServiceImpl userDetailsService = mock(UserDetailsServiceImpl.class);

        AuthTokenFilter filter = new AuthTokenFilter();
        ReflectionTestUtils.setField(filter, "jwtUtils", jwtUtils);
        ReflectionTestUtils.setField(filter, "userDetailsService", userDetailsService);

        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(jwtUtils, never()).validateJwtToken(anyString());
        verify(userDetailsService, never()).loadUserByUsername(anyString());
        verify(chain).doFilter(request, response);
    }

    @Test
    void doFilter_continuesChainWhenJwtProcessingThrows() throws Exception {
        JwtUtils jwtUtils = mock(JwtUtils.class);
        UserDetailsServiceImpl userDetailsService = mock(UserDetailsServiceImpl.class);

        AuthTokenFilter filter = new AuthTokenFilter();
        ReflectionTestUtils.setField(filter, "jwtUtils", jwtUtils);
        ReflectionTestUtils.setField(filter, "userDetailsService", userDetailsService);

        when(jwtUtils.validateJwtToken("token")).thenThrow(new RuntimeException("boom"));

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        verify(chain).doFilter(request, response);
    }
}
