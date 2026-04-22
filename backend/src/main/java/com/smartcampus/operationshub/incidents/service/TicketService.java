package com.smartcampus.operationshub.incidents.service;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.smartcampus.operationshub.incidents.dto.CreateTicketRequest;
import com.smartcampus.operationshub.incidents.dto.TicketResponse;
import com.smartcampus.operationshub.incidents.dto.UpdateTicketRequest;
import com.smartcampus.operationshub.incidents.entity.Ticket;
import com.smartcampus.operationshub.incidents.entity.TicketStatus;
import com.smartcampus.operationshub.incidents.repository.TicketRepository;
import com.smartcampus.operationshub.users.entity.Role;
import com.smartcampus.operationshub.users.entity.User;
import com.smartcampus.operationshub.users.repository.UserRepository;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public TicketService(TicketRepository ticketRepository, UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    @SuppressWarnings("null")
    public TicketResponse createTicket(CreateTicketRequest request, String reporterEmail) {
        User reporter = userRepository.findByEmail(reporterEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Ticket ticket = Ticket.builder()
                .reporter(reporter)
                .category(request.category())
                .description(request.description())
                .priority(request.priority())
                .preferredContact(request.preferredContact())
                .attachmentUrls(request.attachmentUrls())
                .status(TicketStatus.OPEN)
                .build();

        return TicketResponse.from(ticketRepository.save(ticket));
    }

    public List<TicketResponse> getAllTickets() {
        return ticketRepository.findAll()
                .stream()
                .map(TicketResponse::from)
                .toList();
    }

    @SuppressWarnings("null")
    public List<TicketResponse> getMyTickets(String reporterEmail) {
        User reporter = userRepository.findByEmail(reporterEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return ticketRepository.findByReporterId(reporter.getId())
                .stream()
                .map(TicketResponse::from)
                .toList();
    }

    @SuppressWarnings("null")
    public List<TicketResponse> getAssignedTickets(String technicianEmail) {
        return ticketRepository.findByAssignedTechnicianEmail(technicianEmail)
                .stream()
                .map(TicketResponse::from)
                .toList();
    }

    @SuppressWarnings("null")
    public TicketResponse getTicketById(UUID id) {
        return ticketRepository.findById(id)
                .map(TicketResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));
    }

    @SuppressWarnings("null")
    public TicketResponse updateStatus(UUID id, UpdateTicketRequest request) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

        if (request.status() == TicketStatus.REJECTED && (request.rejectionReason() == null || request.rejectionReason().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rejection reason is required when rejecting a ticket");
        }

        ticket.setStatus(request.status());
        ticket.setRejectionReason(request.rejectionReason());
        if (request.resolutionNotes() != null) {
            ticket.setResolutionNotes(request.resolutionNotes());
        }

        return TicketResponse.from(ticketRepository.save(ticket));
    }

    @SuppressWarnings("null")
    public TicketResponse assignTechnician(UUID ticketId, UUID technicianId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Technician not found"));

        if (!technician.getRoles().contains(Role.TECHNICIAN)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not a technician");
        }

        ticket.setAssignedTechnician(technician);
        return TicketResponse.from(ticketRepository.save(ticket));
    }

    @SuppressWarnings("null")
    public void deleteTicket(UUID id, String requesterEmail) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

        boolean isOwner = ticket.getReporter().getEmail().equalsIgnoreCase(requesterEmail);
        if (!isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own tickets");
        }

        ticketRepository.delete(ticket);
    }
}
