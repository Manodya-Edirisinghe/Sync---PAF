package com.smartcampus.operationshub.bookings.service;

import com.smartcampus.operationshub.bookings.BookingStatus;
import com.smartcampus.operationshub.bookings.dto.BookingRequest;
import com.smartcampus.operationshub.bookings.dto.BookingResponse;
import com.smartcampus.operationshub.bookings.entity.Booking;
import com.smartcampus.operationshub.bookings.exception.BookingConflictException;
import com.smartcampus.operationshub.bookings.exception.BookingNotFoundException;
import com.smartcampus.operationshub.bookings.repository.BookingRepository;
import com.smartcampus.operationshub.facilities.entity.Facility;
import com.smartcampus.operationshub.facilities.exception.FacilityNotFoundException;
import com.smartcampus.operationshub.facilities.repository.FacilityRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final FacilityRepository facilityRepository;

    public BookingServiceImpl(BookingRepository bookingRepository,
                              FacilityRepository facilityRepository) {
        this.bookingRepository = bookingRepository;
        this.facilityRepository = facilityRepository;
    }

    @Override
    public BookingResponse createBooking(String userEmail, BookingRequest request) {
        validateDateRange(request.getStartTime(), request.getEndTime());

        Facility facility = facilityRepository.findById(Objects.requireNonNull(request.getFacilityId(), "facilityId must not be null"))
                .orElseThrow(() -> new FacilityNotFoundException(request.getFacilityId()));

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                request.getFacilityId(),
                request.getStartTime(),
                request.getEndTime());

        if (!conflicts.isEmpty()) {
            throw new BookingConflictException("Selected time slot conflicts with an approved booking");
        }

        Booking booking = new Booking();
        booking.setFacilityId(request.getFacilityId());
        booking.setUserEmail(normalizeEmail(userEmail));
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose() != null ? request.getPurpose().trim() : null);
        booking.setAttendees(request.getAttendees());
        booking.setStatus(BookingStatus.PENDING);

        Booking saved = bookingRepository.save(booking);
        return toResponse(saved, facility.getName());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(String userEmail) {
        String normalizedEmail = normalizeEmail(userEmail);
        return bookingRepository.findByUserEmail(normalizedEmail)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsForAdmin(Long facilityId,
                                                     BookingStatus status,
                                                     LocalDateTime from,
                                                     LocalDateTime to) {
        if (facilityId != null && status != null && from != null && to != null) {
            validateDateRange(from, to);
            return bookingRepository.findByFacilityIdAndStatusAndStartTimeBetween(facilityId, status, from, to)
                    .stream()
                    .map(this::toResponse)
                    .toList();
        }

        return bookingRepository.findAll()
                .stream()
                .filter(b -> facilityId == null || b.getFacilityId().equals(facilityId))
                .filter(b -> status == null || b.getStatus() == status)
                .filter(b -> from == null || !b.getStartTime().isBefore(from))
                .filter(b -> to == null || !b.getStartTime().isAfter(to))
                .map(this::toResponse)
                .toList();
    }

    @Override
    public BookingResponse approveBooking(Long id) {
        Booking booking = findOrThrow(id);

        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.REJECTED) {
            throw new IllegalStateException("Only pending bookings can be approved");
        }

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                booking.getFacilityId(),
                booking.getStartTime(),
                booking.getEndTime());

        boolean hasOtherConflict = conflicts.stream()
                .anyMatch(conflict -> !conflict.getId().equals(booking.getId()));

        if (hasOtherConflict) {
            throw new BookingConflictException("Cannot approve booking due to conflict with an already approved booking");
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setRejectionReason(null);

        Booking saved = bookingRepository.save(booking);
        return toResponse(saved);
    }

    @Override
    public BookingResponse rejectBooking(Long id, String rejectionReason) {
        Booking booking = findOrThrow(id);

        if (booking.getStatus() == BookingStatus.APPROVED || booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Only pending bookings can be rejected");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(rejectionReason != null ? rejectionReason.trim() : null);

        Booking saved = bookingRepository.save(booking);
        return toResponse(saved);
    }

    @Override
    public BookingResponse cancelBooking(Long id, String userEmail, boolean isAdmin) {
        Booking booking = findOrThrow(id);

        String normalizedEmail = normalizeEmail(userEmail);
        boolean isOwner = booking.getUserEmail().equalsIgnoreCase(normalizedEmail);

        if (!isOwner && !isAdmin) {
            throw new IllegalArgumentException("You are not allowed to cancel this booking");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);
        return toResponse(saved);
    }

    private Booking findOrThrow(Long id) {
        return bookingRepository.findById(Objects.requireNonNull(id, "id must not be null"))
                .orElseThrow(() -> new BookingNotFoundException(id));
    }

    private void validateDateRange(LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime == null || endTime == null) {
            throw new IllegalArgumentException("startTime and endTime are required");
        }
        if (!endTime.isAfter(startTime)) {
            throw new IllegalArgumentException("endTime must be after startTime");
        }
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Authenticated user email is required");
        }
        return email.trim().toLowerCase();
    }

    private BookingResponse toResponse(Booking booking) {
        String facilityName = facilityRepository.findById(booking.getFacilityId())
                .map(Facility::getName)
                .orElse(null);
        return toResponse(booking, facilityName);
    }

    private BookingResponse toResponse(Booking booking, String facilityName) {
        BookingResponse dto = new BookingResponse();
        dto.setId(booking.getId());
        dto.setFacilityId(booking.getFacilityId());
        dto.setFacilityName(facilityName);
        dto.setUserEmail(booking.getUserEmail());
        dto.setStartTime(booking.getStartTime());
        dto.setEndTime(booking.getEndTime());
        dto.setStatus(booking.getStatus());
        dto.setPurpose(booking.getPurpose());
        dto.setAttendees(booking.getAttendees());
        dto.setRejectionReason(booking.getRejectionReason());
        dto.setCreatedAt(booking.getCreatedAt());
        dto.setUpdatedAt(booking.getUpdatedAt());
        return dto;
    }
}
