package com.smartcampus.operationshub.incidents.controller;

import com.smartcampus.operationshub.incidents.dto.CommentResponse;
import com.smartcampus.operationshub.incidents.dto.CreateCommentRequest;
import com.smartcampus.operationshub.incidents.service.CommentService;
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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/tickets/{ticketId}/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable UUID ticketId,
            @Valid @RequestBody CreateCommentRequest request,
            @CurrentSecurityContext(expression = "authentication") Authentication auth) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(commentService.addComment(ticketId, request, resolveEmail(auth)));
    }

    @GetMapping
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable UUID ticketId) {
        return ResponseEntity.ok(commentService.getComments(ticketId));
    }

    @PatchMapping("/{commentId}")
    public ResponseEntity<CommentResponse> editComment(
            @PathVariable UUID ticketId,
            @PathVariable UUID commentId,
            @Valid @RequestBody CreateCommentRequest request,
            @CurrentSecurityContext(expression = "authentication") Authentication auth) {

        return ResponseEntity.ok(commentService.editComment(ticketId, commentId, request, resolveEmail(auth)));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable UUID ticketId,
            @PathVariable UUID commentId,
            @CurrentSecurityContext(expression = "authentication") Authentication auth) {

        commentService.deleteComment(ticketId, commentId, resolveEmail(auth));
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
