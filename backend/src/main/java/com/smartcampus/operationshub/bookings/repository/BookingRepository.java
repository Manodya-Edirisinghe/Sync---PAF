package com.smartcampus.operationshub.bookings.repository;

import com.smartcampus.operationshub.bookings.BookingStatus;
import com.smartcampus.operationshub.bookings.entity.Booking;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("SELECT b FROM Booking b WHERE b.facilityId = :facilityId AND b.status = 'APPROVED' AND b.startTime < :endTime AND b.endTime > :startTime")
    List<Booking> findConflictingBookings(@Param("facilityId") Long facilityId,
                                          @Param("startTime") LocalDateTime startTime,
                                          @Param("endTime") LocalDateTime endTime);

    List<Booking> findByUserEmail(String email);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByFacilityIdAndStatusAndStartTimeBetween(Long facilityId,
                                                               BookingStatus status,
                                                               LocalDateTime startTime,
                                                               LocalDateTime endTime);
}
