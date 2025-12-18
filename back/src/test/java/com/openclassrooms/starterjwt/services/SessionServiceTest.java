package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SessionServiceTest {

    @Mock
    SessionRepository sessionRepository;

    @Mock
    UserRepository userRepository;

    @InjectMocks
    SessionService sessionService;

    @Test
    void create_delegatesToRepository() {
        Session session = Session.builder().name("n").description("d").date(new Date()).users(new ArrayList<>()).build();
        when(sessionRepository.save(session)).thenReturn(session);

        Session created = sessionService.create(session);

        assertThat(created).isSameAs(session);
    }

    @Test
    void getById_throwsWhenMissing() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionService.getById(1L)).isInstanceOf(NotFoundException.class);
    }

    @Test
    void update_setsIdAndSaves() {
        Session session = Session.builder().name("n").description("d").date(new Date()).users(new ArrayList<>()).build();
        when(sessionRepository.save(session)).thenReturn(session);

        Session updated = sessionService.update(10L, session);

        assertThat(updated.getId()).isEqualTo(10L);
        verify(sessionRepository).save(session);
    }

    @Test
    void participate_addsUserAndSaves() {
        User user = new User("u@example.com", "Last", "First", "pw", false);
        user.setId(2L);
        Session session = Session.builder()
                .id(1L)
                .name("n")
                .description("d")
                .date(new Date())
                .users(new ArrayList<>())
                .build();

        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(userRepository.findById(2L)).thenReturn(Optional.of(user));

        sessionService.participate(1L, 2L);

        assertThat(session.getUsers()).extracting(User::getId).containsExactly(2L);
        verify(sessionRepository).save(session);
    }

    @Test
    void participate_throwsWhenAlreadyParticipating() {
        User user = new User("u@example.com", "Last", "First", "pw", false);
        user.setId(2L);
        Session session = Session.builder()
                .id(1L)
                .name("n")
                .description("d")
                .date(new Date())
                .users(new ArrayList<>(List.of(user)))
                .build();

        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(userRepository.findById(2L)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> sessionService.participate(1L, 2L)).isInstanceOf(BadRequestException.class);
        verify(sessionRepository, never()).save(session);
    }

    @Test
    void noLongerParticipate_removesUserAndSaves() {
        User user1 = new User("u1@example.com", "Last", "First", "pw", false);
        user1.setId(2L);
        User user2 = new User("u2@example.com", "Last", "First", "pw", false);
        user2.setId(3L);
        Session session = Session.builder()
                .id(1L)
                .name("n")
                .description("d")
                .date(new Date())
                .users(new ArrayList<>(List.of(user1, user2)))
                .build();

        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        sessionService.noLongerParticipate(1L, 2L);

        ArgumentCaptor<Session> sessionCaptor = ArgumentCaptor.forClass(Session.class);
        verify(sessionRepository).save(sessionCaptor.capture());
        Session saved = sessionCaptor.getValue();
        assertThat(saved.getUsers()).extracting(User::getId).containsExactly(3L);
    }

    @Test
    void noLongerParticipate_throwsWhenNotParticipating() {
        User user = new User("u@example.com", "Last", "First", "pw", false);
        user.setId(2L);
        Session session = Session.builder()
                .id(1L)
                .name("n")
                .description("d")
                .date(new Date())
                .users(new ArrayList<>(List.of(user)))
                .build();

        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        assertThatThrownBy(() -> sessionService.noLongerParticipate(1L, 99L)).isInstanceOf(BadRequestException.class);
    }
}
