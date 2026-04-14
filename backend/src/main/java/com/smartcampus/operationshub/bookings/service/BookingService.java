package com.smartcampus.operationshub.bookings.service;

import com.smartcampus.operationshub.bookings.BookingStatus;
import com.smartcampus.operationshub.bookings.dto.BookingRequest;
import com.smartcampus.operationshub.bookings.dto.BookingResponse;
import java.time.LocalDateTime;
import java.util.List;

public interface BookingService {

    BookingResponse createBooking(String userEmail, BookingRequest request);

    List<BookingResponse> getMyBookings(String userEmail);

    List<BookingResponse> getBookingsForAdmin(Long facilityId,
                                              BookingStatus status,
                                              LocalDateTime from,
                                              LocalDateTime to);

    BookingResponse approveBooking(Long id);

    BookingResponse rejectBooking(Long id, String rejectionReason);

    BookingResponse cancelBooking(Long id, String userEmail, boolean isAdmin);
}
