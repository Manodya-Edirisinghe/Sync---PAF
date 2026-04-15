package com.smartcampus.operationshub.bookings.exception;

public class BookingConflictException extends RuntimeException {

    public BookingConflictException() {
        super("Facility is already booked for the requested time range.");
    }

    public BookingConflictException(String message) {
        super(message);
    }
}
