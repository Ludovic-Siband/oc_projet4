package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    UserRepository userRepository;

    @InjectMocks
    UserService userService;

    @Test
    void delete_delegatesToRepository() {
        userService.delete(1L);
        verify(userRepository).deleteById(1L);
    }

    @Test
    void findById_throwsWhenMissing() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> userService.findById(1L)).isInstanceOf(NotFoundException.class);
    }

    @Test
    void findById_returnsUserWhenPresent() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(new User("u@example.com", "Last", "First", "pw", false)));
        userService.findById(1L);
        verify(userRepository).findById(1L);
    }
}
