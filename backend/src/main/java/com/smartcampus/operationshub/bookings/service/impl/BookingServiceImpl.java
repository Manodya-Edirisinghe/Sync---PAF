package com.smartcampus.operationshub.bookings.service.impl;

import com.smartcampus.operationshub.bookings.BookingStatus;
import com.smartcampus.operationshub.bookings.dto.BookingRequest;
import com.smartcampus.operationshub.bookings.dto.BookingResponse;
import com.smartcampus.operationshub.bookings.entity.Booking;
import com.smartcampus.operationshub.bookings.exception.BookingConflictException;
import com.smartcampus.operationshub.bookings.exception.BookingNotFoundException;
import com.smartcampus.operationshub.bookings.repository.BookingRepository;
import com.smartcampus.operationshub.bookings.service.BookingService;
import com.smartcampus.operationshub.common.entity.Notification;
import com.smartcampus.operationshub.common.repository.NotificationRepository;
import com.smartcampus.operationshub.facilities.entity.Facility;
import com.smartcampus.operationshub.facilities.entity.FacilityStatus;
import com.smartcampus.operationshub.facilities.exception.ResourceNotFoundException;
import com.smartcampus.operationshub.facilities.repository.FacilityRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class BookingServiceImpl implements BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingServiceImpl.class);

    private final BookingRepository bookingRepository;
    private final FacilityRepository facilityRepository;
    private final NotificationRepository notificationRepository;

    public BookingServiceImpl(BookingRepository bookingRepository,
                              FacilityRepository facilityRepository,
                              NotificationRepository notificationRepository) {
        this.bookingRepository = bookingRepository;
        this.facilityRepository = facilityRepository;
        this.notificationRepository = notificationRepository;
    }

    @Override
    public BookingResponse createBooking(BookingRequest request, String userEmail) {
        Long facilityId = Objects.requireNonNull(request.getFacilityId(), "facilityId is required");
        String normalizedEmail = normalizeEmail(userEmail);

        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with id: " + facilityId));

        if (facility.getStatus() != FacilityStatus.ACTIVE) {
            throw new IllegalStateException("Facility is not active and cannot be booked.");
        }

        validateStartAndEnd(request.getStartTime(), request.getEndTime());

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                facilityId,
                request.getStartTime(),
                request.getEndTime());

        if (!conflicts.isEmpty()) {
            throw new BookingConflictException();
        }

        Booking booking = new Booking();
        booking.setFacilityId(facilityId);
        booking.setUserEmail(normalizedEmail);
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose() != null ? request.getPurpose().trim() : null);
        booking.setAttendees(request.getAttendees());
        booking.setStatus(BookingStatus.PENDING);

        Booking saved = bookingRepository.save(booking);

        saveNotification(
                normalizedEmail,
                "[BOOKINGS] Your booking request for facility '" + facility.getName()
                        + "' has been submitted and is pending approval.");

        return toResponse(saved, facility.getName());
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id, String userEmail, boolean isAdmin) {
        Booking booking = findBooking(id);
        String normalizedEmail = normalizeEmail(userEmail);

        if (!isAdmin && !booking.getUserEmail().equalsIgnoreCase(normalizedEmail)) {
            throw new IllegalArgumentException("You are not allowed to view this booking.");
        }

        return toResponse(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getUserBookings(String userEmail) {
        String normalizedEmail = normalizeEmail(userEmail);
        return bookingRepository.findByUserEmail(normalizedEmail)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings(BookingStatus statusFilter, Long facilityIdFilter) {
        return bookingRepository.findAll()
                .stream()
                .filter(booking -> statusFilter == null || booking.getStatus() == statusFilter)
                .filter(booking -> facilityIdFilter == null || booking.getFacilityId().equals(facilityIdFilter))
                .map(this::toResponse)
                .toList();
    }

    @Override
    public BookingResponse approveBooking(Long id) {
        Booking booking = findBooking(id);
        booking.setStatus(BookingStatus.APPROVED);
        booking.setRejectionReason(null);

        Booking saved = bookingRepository.save(booking);
        String facilityName = resolveFacilityName(saved.getFacilityId());

        saveNotification(
                saved.getUserEmail(),
                "[BOOKINGS] Your booking for facility '" + facilityName + "' on "
                        + saved.getStartTime().toLocalDate() + " has been APPROVED.");

        return toResponse(saved, facilityName);
    }

    @Override
    public BookingResponse rejectBooking(Long id, String reason) {
        Booking booking = findBooking(id);
        String normalizedReason = reason == null ? "" : reason.trim();

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(normalizedReason);

        Booking saved = bookingRepository.save(booking);
        String facilityName = resolveFacilityName(saved.getFacilityId());

        saveNotification(
                saved.getUserEmail(),
                "[BOOKINGS] Your booking for facility '" + facilityName
                        + "' has been REJECTED. Reason: " + normalizedReason);

        return toResponse(saved, facilityName);
    }

    @Override
    public BookingResponse cancelBooking(Long id, String userEmail, boolean isAdmin) {
        Booking booking = findBooking(id);
        String normalizedEmail = normalizeEmail(userEmail);
        boolean isOwner = booking.getUserEmail().equalsIgnoreCase(normalizedEmail);

        if (!isOwner && !isAdmin) {
            throw new IllegalArgumentException("You are not allowed to cancel this booking.");
        }

        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.APPROVED) {
            throw new IllegalStateException("Only PENDING or APPROVED bookings can be cancelled.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);
        String facilityName = resolveFacilityName(saved.getFacilityId());

        saveNotification(
                saved.getUserEmail(),
                "[BOOKINGS] Your booking for facility '" + facilityName + "' has been CANCELLED.");

        return toResponse(saved, facilityName);
    }

    private Booking findBooking(Long id) {
        return bookingRepository.findById(Objects.requireNonNull(id, "id is required"))
                .orElseThrow(() -> new BookingNotFoundException(id));
    }

    private void validateStartAndEnd(LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime == null || endTime == null) {
            throw new IllegalArgumentException("startTime and endTime are required.");
        }
        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("startTime must be before endTime.");
        }
        if (!startTime.isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("startTime must be in the future.");
        }
    }

    private String normalizeEmail(String userEmail) {
        if (userEmail == null || userEmail.isBlank()) {
            throw new IllegalArgumentException("Authenticated user email is required.");
        }
        return userEmail.trim().toLowerCase();
    }

    private void saveNotification(String userEmail, String message) {
        Notification notification = Notification.builder()
                .userEmail(userEmail)
                .message(message)
                .type("BOOKING")
                .read(false)
                .build();
        try {
            notificationRepository.save(notification);
        } catch (RuntimeException ex) {
            // Notification is non-critical; booking operation should still succeed.
            log.warn("Failed to persist booking notification for user {}: {}", userEmail, ex.getMessage());
        }
    }

    private String resolveFacilityName(Long facilityId) {
        return facilityRepository.findById(facilityId)
                .map(Facility::getName)
                .orElse("Unknown Facility");
    }

    private BookingResponse toResponse(Booking booking) {
        return toResponse(booking, resolveFacilityName(booking.getFacilityId()));
    }

    private BookingResponse toResponse(Booking booking, String facilityName) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setFacilityId(booking.getFacilityId());
        response.setFacilityName(facilityName);
        response.setUserEmail(booking.getUserEmail());
        response.setStartTime(booking.getStartTime());
        response.setEndTime(booking.getEndTime());
        response.setStatus(booking.getStatus());
        response.setPurpose(booking.getPurpose());
        response.setAttendees(booking.getAttendees());
        response.setRejectionReason(booking.getRejectionReason());
        response.setCreatedAt(booking.getCreatedAt());
        response.setUpdatedAt(booking.getUpdatedAt());
        return response;
    }
}
