package com.smartcampus.operationshub.incidents.controller;

import com.smartcampus.operationshub.incidents.dto.CreateTicketRequest;
import com.smartcampus.operationshub.incidents.dto.TicketResponse;
import com.smartcampus.operationshub.incidents.dto.UpdateTicketRequest;
import com.smartcampus.operationshub.incidents.service.TicketService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.CurrentSecurityContext;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(
            @Valid @RequestBody CreateTicketRequest request,
            @CurrentSecurityContext(expression = "authentication") Authentication auth) {

        String email = resolveEmail(auth);
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.createTicket(request, email));
    }

    @GetMapping
    public ResponseEntity<List<TicketResponse>> getTickets(
            @CurrentSecurityContext(expression = "authentication") Authentication auth) {

        String email = resolveEmail(auth);
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin) {
            return ResponseEntity.ok(ticketService.getAllTickets());
        }
        return ResponseEntity.ok(ticketService.getMyTickets(email));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable UUID id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTicketRequest request) {

        return ResponseEntity.ok(ticketService.updateStatus(id, request));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<TicketResponse> assignTechnician(
            @PathVariable UUID id,
            @RequestParam UUID technicianId) {

        return ResponseEntity.ok(ticketService.assignTechnician(id, technicianId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(
            @PathVariable UUID id,
            @CurrentSecurityContext(expression = "authentication") Authentication auth) {

        ticketService.deleteTicket(id, resolveEmail(auth));
        return ResponseEntity.noContent().build();
    }

    private String resolveEmail(Authentication auth) {
        Object principal = auth.getPrincipal();
        if (principal instanceof OAuth2User oauth2User) {
            Object email = oauth2User.getAttributes().get("email");
            if (email instanceof String s) return s.trim().toLowerCase();
        }
        return auth.getName().trim().toLowerCase();
    }
}
