package com.openclassrooms.starterjwt.security.services;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

class UserDetailsImplTest {

    @Test
    void equals_comparesById() {
        UserDetailsImpl a = UserDetailsImpl.builder().id(1L).username("a").password("p").build();
        UserDetailsImpl b = UserDetailsImpl.builder().id(1L).username("b").password("p").build();
        UserDetailsImpl c = UserDetailsImpl.builder().id(2L).username("c").password("p").build();

        assertAll(
                () -> assertEquals(a, b),
                () -> assertNotEquals(a, c),
                () -> assertNotEquals(a, null));
    }

    @Test
    void getAuthorities_isEmpty() {
        UserDetailsImpl user = UserDetailsImpl.builder().id(1L).username("a").password("p").build();
        assertThat(user.getAuthorities()).isEmpty();
    }
}
