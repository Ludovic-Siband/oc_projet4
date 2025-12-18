package com.openclassrooms.starterjwt.security.services;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class UserDetailsServiceImplTest {

    @Test
    void loadUserByUsername_throwsWhenMissing() {
        UserRepository userRepository = mock(UserRepository.class);
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        UserDetailsServiceImpl service = new UserDetailsServiceImpl(userRepository);

        assertThatThrownBy(() -> service.loadUserByUsername("missing@example.com"))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessageContaining("missing@example.com");
    }

    @Test
    void loadUserByUsername_mapsEntityToUserDetails() {
        UserRepository userRepository = mock(UserRepository.class);
        User user = new User("u@example.com", "Last", "First", "pw", false);
        user.setId(12L);
        when(userRepository.findByEmail("u@example.com")).thenReturn(Optional.of(user));

        UserDetailsServiceImpl service = new UserDetailsServiceImpl(userRepository);

        UserDetailsImpl details = (UserDetailsImpl) service.loadUserByUsername("u@example.com");

        assertThat(details)
                .extracting(
                        UserDetailsImpl::getId,
                        UserDetailsImpl::getUsername,
                        UserDetailsImpl::getFirstName,
                        UserDetailsImpl::getLastName,
                        UserDetailsImpl::getPassword)
                .containsExactly(12L, "u@example.com", "First", "Last", "pw");
    }
}
