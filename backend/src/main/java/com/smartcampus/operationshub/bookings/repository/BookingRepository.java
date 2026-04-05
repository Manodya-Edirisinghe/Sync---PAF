package com.smartcampus.operationshub.bookings.repository;

import com.smartcampus.operationshub.bookings.entity.Booking;
import com.smartcampus.operationshub.bookings.entity.BookingStatus;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, UUID> {
    List<Booking> findByStatus(BookingStatus status);
    List<Booking> findByFacilityIdAndStartsAtLessThanEqualAndEndsAtGreaterThanEqual(UUID facilityId, Instant start, Instant end);
}
