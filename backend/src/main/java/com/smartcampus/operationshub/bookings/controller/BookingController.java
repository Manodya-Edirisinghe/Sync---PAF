package com.smartcampus.operationshub.bookings.controller;

import com.smartcampus.operationshub.bookings.BookingStatus;
import com.smartcampus.operationshub.bookings.dto.BookingDecisionRequest;
import com.smartcampus.operationshub.bookings.dto.BookingRequest;
import com.smartcampus.operationshub.bookings.dto.BookingResponse;
import com.smartcampus.operationshub.bookings.service.BookingService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/bookings")
@Validated
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingRequest request,
                                                         Authentication authentication) {
        String email = resolveEmail(authentication);
        BookingResponse created = bookingService.createBooking(request, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/me")
    public ResponseEntity<List<BookingResponse>> getMyBookings(Authentication authentication) {
        String email = resolveEmail(authentication);
        return ResponseEntity.ok(bookingService.getUserBookings(email));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponse>> getBookingsForAdmin(
            @RequestParam(required = false) Long facilityId,
            @RequestParam(required = false) BookingStatus status) {
        return ResponseEntity.ok(bookingService.getAllBookings(status, facilityId));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> approveBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.approveBooking(id));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> rejectBooking(@PathVariable Long id,
                                                         @Valid @RequestBody BookingDecisionRequest request) {
        return ResponseEntity.ok(bookingService.rejectBooking(id, request.getRejectionReason()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<BookingResponse> cancelBooking(@PathVariable Long id, Authentication authentication) {
        String email = resolveEmail(authentication);
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(auth -> "ROLE_ADMIN".equals(auth.getAuthority()));
        return ResponseEntity.ok(bookingService.cancelBooking(id, email, isAdmin));
    }

    private String resolveEmail(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("Not authenticated");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof OAuth2User oauth2User) {
            Object email = oauth2User.getAttributes().get("email");
            if (email instanceof String s && !s.isBlank()) {
                return s.trim().toLowerCase();
            }
        }

        String name = authentication.getName();
        if (name != null && !name.isBlank()) {
            return name.trim().toLowerCase();
        }

        throw new IllegalArgumentException("Could not resolve authenticated user email");
    }
}
