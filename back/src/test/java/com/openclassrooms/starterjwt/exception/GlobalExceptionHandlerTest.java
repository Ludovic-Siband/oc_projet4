package com.openclassrooms.starterjwt.exception;

import com.openclassrooms.starterjwt.payload.response.MessageResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleNumberFormatException_returnsBadRequest() {
        ResponseEntity<Void> response = handler.handleNumberFormatException(new NumberFormatException("bad"));
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void handleBadRequestException_returnsBadRequestWithoutBodyWhenMessageBlank() {
        ResponseEntity<?> response = handler.handleBadRequestException(new BadRequestException(" "));
        assertThat(response)
                .extracting(ResponseEntity::getStatusCode, ResponseEntity::getBody)
                .containsExactly(HttpStatus.BAD_REQUEST, null);
    }

    @Test
    void handleBadRequestException_returnsBadRequestWithMessageWhenPresent() {
        ResponseEntity<?> response = handler.handleBadRequestException(new BadRequestException("boom"));
        assertThat(response)
                .extracting(ResponseEntity::getStatusCode, ResponseEntity::getBody)
                .containsExactly(HttpStatus.BAD_REQUEST, new MessageResponse("boom"));
    }

    @Test
    void handleNotFoundException_returnsNotFound() {
        ResponseEntity<Void> response = handler.handleNotFoundException(new NotFoundException());
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}
