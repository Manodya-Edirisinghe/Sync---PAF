package com.smartcampus.operationshub.bookings.service;

import com.smartcampus.operationshub.bookings.BookingStatus;
import com.smartcampus.operationshub.bookings.dto.BookingRequest;
import com.smartcampus.operationshub.bookings.dto.BookingResponse;
import java.util.List;

public interface BookingService {

    BookingResponse createBooking(BookingRequest request, String userEmail);

    BookingResponse getBookingById(Long id, String userEmail, boolean isAdmin);

    List<BookingResponse> getUserBookings(String userEmail);

    List<BookingResponse> getAllBookings(BookingStatus statusFilter, Long facilityIdFilter);

    BookingResponse approveBooking(Long id);

    BookingResponse rejectBooking(Long id, String reason);

    BookingResponse cancelBooking(Long id, String userEmail, boolean isAdmin);
}
