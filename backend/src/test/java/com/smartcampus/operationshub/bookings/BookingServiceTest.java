package com.smartcampus.operationshub.bookings;

import com.smartcampus.operationshub.bookings.dto.BookingRequest;
import com.smartcampus.operationshub.bookings.dto.BookingResponse;
import com.smartcampus.operationshub.bookings.entity.Booking;
import com.smartcampus.operationshub.bookings.exception.BookingConflictException;
import com.smartcampus.operationshub.bookings.repository.BookingRepository;
import com.smartcampus.operationshub.bookings.service.impl.BookingServiceImpl;
import com.smartcampus.operationshub.common.entity.Notification;
import com.smartcampus.operationshub.common.repository.NotificationRepository;
import com.smartcampus.operationshub.facilities.entity.Facility;
import com.smartcampus.operationshub.facilities.entity.FacilityStatus;
import com.smartcampus.operationshub.facilities.entity.FacilityType;
import com.smartcampus.operationshub.facilities.exception.ResourceNotFoundException;
import com.smartcampus.operationshub.facilities.repository.FacilityRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private FacilityRepository facilityRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private BookingServiceImpl bookingService;

    private BookingRequest validRequest;

    @BeforeEach
    void setUp() {
        LocalDateTime start = LocalDateTime.now().plusDays(2).withHour(10).withMinute(0);
        validRequest = new BookingRequest();
        validRequest.setFacilityId(1L);
        validRequest.setStartTime(start);
        validRequest.setEndTime(start.plusHours(2));
        validRequest.setPurpose("Module B test booking");
        validRequest.setAttendees(20);
    }

    @Test
    void createBooking_success() {
        Facility activeFacility = facility(1L, "Innovation Lab", FacilityStatus.ACTIVE);

        when(facilityRepository.findById(1L)).thenReturn(Optional.of(activeFacility));
        when(bookingRepository.findConflictingBookings(eq(1L), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of());
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking booking = invocation.getArgument(0);
            booking.setId(100L);
            return booking;
        });

        BookingResponse result = bookingService.createBooking(validRequest, "user@test.com");

        assertThat(result.getStatus()).isEqualTo(BookingStatus.PENDING);
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void createBooking_facilityNotFound() {
        when(facilityRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.createBooking(validRequest, "user@test.com"))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void createBooking_facilityNotActive() {
        when(facilityRepository.findById(1L)).thenReturn(Optional.of(facility(1L, "Lab", FacilityStatus.OUT_OF_SERVICE)));

        assertThatThrownBy(() -> bookingService.createBooking(validRequest, "user@test.com"))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void createBooking_conflictDetected() {
        when(facilityRepository.findById(1L)).thenReturn(Optional.of(facility(1L, "Lab", FacilityStatus.ACTIVE)));
        when(bookingRepository.findConflictingBookings(eq(1L), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(booking(2L, BookingStatus.APPROVED, "other@test.com")));

        assertThatThrownBy(() -> bookingService.createBooking(validRequest, "user@test.com"))
                .isInstanceOf(BookingConflictException.class);
    }

    @Test
    void approveBooking_success() {
        Booking pending = booking(1L, BookingStatus.PENDING, "user@test.com");

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(pending));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(facilityRepository.findById(1L)).thenReturn(Optional.of(facility(1L, "Main Hall", FacilityStatus.ACTIVE)));

        BookingResponse result = bookingService.approveBooking(1L);

        assertThat(result.getStatus()).isEqualTo(BookingStatus.APPROVED);
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void rejectBooking_success() {
        Booking pending = booking(1L, BookingStatus.PENDING, "user@test.com");

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(pending));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(facilityRepository.findById(1L)).thenReturn(Optional.of(facility(1L, "Main Hall", FacilityStatus.ACTIVE)));

        BookingResponse result = bookingService.rejectBooking(1L, "Schedule overlap");

        assertThat(result.getStatus()).isEqualTo(BookingStatus.REJECTED);
        assertThat(result.getRejectionReason()).isEqualTo("Schedule overlap");
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void cancelBooking_byOwner() {
        Booking pending = booking(1L, BookingStatus.PENDING, "user@test.com");

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(pending));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(facilityRepository.findById(1L)).thenReturn(Optional.of(facility(1L, "Main Hall", FacilityStatus.ACTIVE)));

        BookingResponse result = bookingService.cancelBooking(1L, "user@test.com", false);

        assertThat(result.getStatus()).isEqualTo(BookingStatus.CANCELLED);
    }

    @Test
    void cancelBooking_byAdmin() {
        Booking pending = booking(1L, BookingStatus.PENDING, "other@test.com");

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(pending));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(facilityRepository.findById(1L)).thenReturn(Optional.of(facility(1L, "Main Hall", FacilityStatus.ACTIVE)));

        BookingResponse result = bookingService.cancelBooking(1L, "admin@test.com", true);

        assertThat(result.getStatus()).isEqualTo(BookingStatus.CANCELLED);
    }

    @Test
    void cancelBooking_unauthorized() {
        Booking pending = booking(1L, BookingStatus.PENDING, "other@test.com");

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(pending));

        assertThatThrownBy(() -> bookingService.cancelBooking(1L, "hacker@test.com", false))
                .isInstanceOf(IllegalArgumentException.class);
    }

    private Facility facility(Long id, String name, FacilityStatus status) {
        Facility facility = new Facility();
        facility.setId(id);
        facility.setName(name);
        facility.setType(FacilityType.LAB);
        facility.setCapacity(50);
        facility.setStatus(status);
        return facility;
    }

    private Booking booking(Long facilityId, BookingStatus status, String userEmail) {
        Booking booking = new Booking();
        booking.setId(1L);
        booking.setFacilityId(facilityId);
        booking.setUserEmail(userEmail);
        booking.setStatus(status);
        booking.setPurpose("Testing booking flow");
        booking.setStartTime(LocalDateTime.now().plusDays(3));
        booking.setEndTime(LocalDateTime.now().plusDays(3).plusHours(1));
        return booking;
    }
}
