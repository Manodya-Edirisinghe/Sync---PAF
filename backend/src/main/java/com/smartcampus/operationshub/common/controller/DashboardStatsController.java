package com.smartcampus.operationshub.common.controller;

import com.smartcampus.operationshub.bookings.entity.BookingStatus;
import com.smartcampus.operationshub.bookings.repository.BookingRepository;
import com.smartcampus.operationshub.common.dto.StatsDTO;
import com.smartcampus.operationshub.facilities.repository.FacilityRepository;
import com.smartcampus.operationshub.incidents.repository.TicketRepository;
import com.smartcampus.operationshub.users.repository.UserRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
public class DashboardStatsController {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final FacilityRepository facilityRepository;

    public DashboardStatsController(UserRepository userRepository,
                                    BookingRepository bookingRepository,
                                    TicketRepository ticketRepository,
                                    FacilityRepository facilityRepository) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.ticketRepository = ticketRepository;
        this.facilityRepository = facilityRepository;
    }

    @GetMapping
    public StatsDTO getStats() {
        return StatsDTO.builder()
                .userCount(userRepository.count())
                .bookingCount(bookingRepository.count())
                .incidentCount(ticketRepository.count())
                .resourceCount(facilityRepository.count())
                .pendingApprovalCount(bookingRepository.findByStatus(BookingStatus.PENDING).size())
                .build();
    }

    @GetMapping("/admin")
    public StatsDTO getAdminStats() {
        // For now, same as regular stats, but could include restricted data later
        return getStats();
    }
}
