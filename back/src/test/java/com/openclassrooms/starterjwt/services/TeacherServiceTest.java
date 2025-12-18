package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TeacherServiceTest {

    @Mock
    TeacherRepository teacherRepository;

    @InjectMocks
    TeacherService teacherService;

    @Test
    void findAll_delegatesToRepository() {
        when(teacherRepository.findAll()).thenReturn(List.of(new Teacher()));

        assertThat(teacherService.findAll()).hasSize(1);
    }

    @Test
    void findById_throwsWhenMissing() {
        when(teacherRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> teacherService.findById(1L)).isInstanceOf(NotFoundException.class);
    }
}
