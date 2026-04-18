package com.smartcampus.operationshub.incidents.dto;

import com.smartcampus.operationshub.incidents.entity.Ticket;
import com.smartcampus.operationshub.incidents.entity.TicketPriority;
import com.smartcampus.operationshub.incidents.entity.TicketStatus;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public record TicketResponse(
        UUID id,
        String reporterName,
        String reporterEmail,
        String category,
        String description,
        TicketPriority priority,
        String preferredContact,
        Set<String> attachmentUrls,
        TicketStatus status,
        String assignedTechnicianName,
        String assignedTechnicianEmail,
        String rejectionReason,
        String resolutionNotes,
        Instant createdAt,
        Instant updatedAt
) {
    public static TicketResponse from(Ticket ticket) {
        return new TicketResponse(
                ticket.getId(),
                ticket.getReporter().getDisplayName(),
                ticket.getReporter().getEmail(),
                ticket.getCategory(),
                ticket.getDescription(),
                ticket.getPriority(),
                ticket.getPreferredContact(),
                ticket.getAttachmentUrls(),
                ticket.getStatus(),
                ticket.getAssignedTechnician() != null ? ticket.getAssignedTechnician().getDisplayName() : null,
                ticket.getAssignedTechnician() != null ? ticket.getAssignedTechnician().getEmail() : null,
                ticket.getRejectionReason(),
                ticket.getResolutionNotes(),
                ticket.getCreatedAt(),
                ticket.getUpdatedAt()
        );
    }
}
