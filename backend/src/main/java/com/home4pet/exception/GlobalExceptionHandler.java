package com.home4pet.exception;

import com.home4pet.common.response.ErrorResponse;
import com.stripe.exception.StripeException;
import io.jsonwebtoken.JwtException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.List;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException ex) {
        log.warn("Business exception: {}", ex.getMessage());
        return buildErrorResponse(ex.getStatus(), ex.getStatus().getReasonPhrase(), ex.getMessage(), null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
        List<ErrorResponse.FieldError> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .map(this::mapFieldError)
                .toList();

        return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                "Validation failed",
                fieldErrors
        );
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentialsException(BadCredentialsException ex) {
        return buildErrorResponse(
                HttpStatus.UNAUTHORIZED,
                HttpStatus.UNAUTHORIZED.getReasonPhrase(),
                "Invalid email or password",
                null
        );
    }

    @ExceptionHandler({DisabledException.class, UsernameNotFoundException.class})
    public ResponseEntity<ErrorResponse> handleAccountException(RuntimeException ex) {
        return buildErrorResponse(
                HttpStatus.UNAUTHORIZED,
                HttpStatus.UNAUTHORIZED.getReasonPhrase(),
                "Account is disabled or not found",
                null
        );
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(AccessDeniedException ex) {
        return buildErrorResponse(
                HttpStatus.FORBIDDEN,
                HttpStatus.FORBIDDEN.getReasonPhrase(),
                "Access denied",
                null
        );
    }

    @ExceptionHandler(JwtException.class)
    public ResponseEntity<ErrorResponse> handleJwtException(JwtException ex) {
        return buildErrorResponse(
                HttpStatus.UNAUTHORIZED,
                HttpStatus.UNAUTHORIZED.getReasonPhrase(),
                "Invalid or expired token",
                null
        );
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                "Malformed JSON request",
                null
        );
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String message = String.format("Invalid value '%s' for parameter '%s'", ex.getValue(), ex.getName());
        return buildErrorResponse(HttpStatus.BAD_REQUEST, HttpStatus.BAD_REQUEST.getReasonPhrase(), message, null);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        log.warn("Data integrity violation: {}", ex.getMessage());
        return buildErrorResponse(
                HttpStatus.CONFLICT,
                HttpStatus.CONFLICT.getReasonPhrase(),
                "Operation violates data constraints. The resource may be linked to other records.",
                null
        );
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException ex) {
        return buildErrorResponse(
                HttpStatus.PAYLOAD_TOO_LARGE,
                HttpStatus.PAYLOAD_TOO_LARGE.getReasonPhrase(),
                "File size exceeds the maximum allowed limit",
                null
        );
    }

    @ExceptionHandler(StripeException.class)
    public ResponseEntity<ErrorResponse> handleStripeException(StripeException ex) {
        log.error("Stripe API error: code={} message={}", ex.getCode(), ex.getMessage());
        return buildErrorResponse(
                HttpStatus.SERVICE_UNAVAILABLE,
                HttpStatus.SERVICE_UNAVAILABLE.getReasonPhrase(),
                "Payment service error. Please try again later.",
                null
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        log.error("Unexpected error", ex);
        return buildErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                "An unexpected error occurred",
                null
        );
    }

    private ErrorResponse.FieldError mapFieldError(FieldError fieldError) {
        return ErrorResponse.FieldError.builder()
                .field(fieldError.getField())
                .message(fieldError.getDefaultMessage())
                .rejectedValue(fieldError.getRejectedValue())
                .build();
    }

    private ResponseEntity<ErrorResponse> buildErrorResponse(
            HttpStatus status,
            String error,
            String message,
            List<ErrorResponse.FieldError> fieldErrors
    ) {
        ErrorResponse body = ErrorResponse.builder()
                .status(status.value())
                .error(error)
                .message(message)
                .fieldErrors(fieldErrors)
                .build();
        return ResponseEntity.status(status).body(body);
    }
}
