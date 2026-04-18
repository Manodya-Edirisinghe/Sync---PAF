package com.smartcampus.operationshub.incidents.dto;

import com.smartcampus.operationshub.incidents.entity.Comment;
import java.time.Instant;
import java.util.UUID;

public record CommentResponse(
        UUID id,
        UUID ticketId,
        String authorName,
        String authorEmail,
        String content,
        Instant createdAt,
        Instant updatedAt
) {
    public static CommentResponse from(Comment comment) {
        return new CommentResponse(
                comment.getId(),
                comment.getTicket().getId(),
                comment.getAuthor().getDisplayName(),
                comment.getAuthor().getEmail(),
                comment.getContent(),
                comment.getCreatedAt(),
                comment.getUpdatedAt()
        );
    }
}
