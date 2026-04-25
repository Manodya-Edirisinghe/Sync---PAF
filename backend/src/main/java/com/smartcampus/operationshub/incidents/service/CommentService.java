package com.smartcampus.operationshub.incidents.service;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.smartcampus.operationshub.incidents.dto.CommentResponse;
import com.smartcampus.operationshub.incidents.dto.CreateCommentRequest;
import com.smartcampus.operationshub.incidents.entity.Comment;
import com.smartcampus.operationshub.incidents.entity.Ticket;
import com.smartcampus.operationshub.incidents.repository.CommentRepository;
import com.smartcampus.operationshub.incidents.repository.TicketRepository;
import com.smartcampus.operationshub.users.entity.User;
import com.smartcampus.operationshub.users.repository.UserRepository;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public CommentService(CommentRepository commentRepository, TicketRepository ticketRepository, UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    public CommentResponse addComment(UUID ticketId, CreateCommentRequest request, String authorEmail) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

        User author = userRepository.findByEmail(authorEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Comment comment = Comment.builder()
                .ticket(ticket)
                .author(author)
                .content(request.content())
                .build();

        return CommentResponse.from(commentRepository.save(comment));
    }

    public List<CommentResponse> getComments(UUID ticketId) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found");
        }
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream()
                .map(CommentResponse::from)
                .toList();
    }

    public CommentResponse editComment(UUID ticketId, UUID commentId, CreateCommentRequest request, String requesterEmail) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));

        if (!comment.getTicket().getId().equals(ticketId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment does not belong to this ticket");
        }

        if (!comment.getAuthor().getEmail().equalsIgnoreCase(requesterEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only edit your own comments");
        }

        comment.setContent(request.content());
        return CommentResponse.from(commentRepository.save(comment));
    }

    public void deleteComment(UUID ticketId, UUID commentId, String requesterEmail) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));

        if (!comment.getTicket().getId().equals(ticketId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment does not belong to this ticket");
        }

        if (!comment.getAuthor().getEmail().equalsIgnoreCase(requesterEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }
}
