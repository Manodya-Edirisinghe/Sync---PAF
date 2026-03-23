package com.smartcampus.operationshub.incidents.repository;

import com.smartcampus.operationshub.incidents.entity.Ticket;
import com.smartcampus.operationshub.incidents.entity.TicketStatus;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketRepository extends JpaRepository<Ticket, UUID> {
    List<Ticket> findByStatus(TicketStatus status);
    List<Ticket> findByReporterId(UUID reporterId);
}
