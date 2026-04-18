package com.smartcampus.operationshub.incidents.dto;

import com.smartcampus.operationshub.incidents.entity.TicketStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateTicketRequest(

        @NotNull(message = "Status is required")
        TicketStatus status,

        String rejectionReason
) {}
