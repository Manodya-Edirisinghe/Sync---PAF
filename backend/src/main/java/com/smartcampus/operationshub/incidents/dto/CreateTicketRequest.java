package com.smartcampus.operationshub.incidents.dto;

import com.smartcampus.operationshub.incidents.entity.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.HashSet;
import java.util.Set;

public record CreateTicketRequest(

        @NotBlank(message = "Category is required")
        String category,

        @NotBlank(message = "Description is required")
        @Size(max = 2000, message = "Description must not exceed 2000 characters")
        String description,

        @NotNull(message = "Priority is required")
        TicketPriority priority,

        @NotBlank(message = "Preferred contact is required")
        String preferredContact,

        @Size(max = 3, message = "Maximum 3 attachments allowed")
        Set<String> attachmentUrls
) {
    public CreateTicketRequest {
        if (attachmentUrls == null) attachmentUrls = new HashSet<>();
    }
}
