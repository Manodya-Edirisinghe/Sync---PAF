package com.smartcampus.operationshub.common.controller;

import com.smartcampus.operationshub.bookings.entity.BookingStatus;
import com.smartcampus.operationshub.bookings.repository.BookingRepository;
import com.smartcampus.operationshub.common.dto.StatsDTO;
import com.smartcampus.operationshub.facilities.repository.ResourceRepository;
import com.smartcampus.operationshub.incidents.repository.TicketRepository;
import com.smartcampus.operationshub.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class DashboardStatsController {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final ResourceRepository resourceRepository;

    @GetMapping
    public StatsDTO getStats() {
        return StatsDTO.builder()
                .userCount(userRepository.count())
                .bookingCount(bookingRepository.count())
                .incidentCount(ticketRepository.count())
                .resourceCount(resourceRepository.count())
                .pendingApprovalCount(bookingRepository.findByStatus(BookingStatus.PENDING).size())
                .build();
    }

    @GetMapping("/admin")
    public StatsDTO getAdminStats() {
        // For now, same as regular stats, but could include restricted data later
        return getStats();
    }
}
