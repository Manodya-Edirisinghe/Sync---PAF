package com.smartcampus.operationshub.users.controller;

import com.smartcampus.operationshub.users.entity.User;
import com.smartcampus.operationshub.users.repository.UserRepository;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.CurrentSecurityContext;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.smartcampus.operationshub.users.entity.Role;
import java.util.UUID;
import java.util.Objects;


@RestController
@RequestMapping("/api")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Returns the currently authenticated user's profile from the Neon database.
     * Works for both Google OAuth2 sessions and (legacy) form-login sessions.
     * Called by the React frontend's AuthContext on every page load.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(
            @CurrentSecurityContext(expression = "authentication") Authentication auth) {

        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        // Resolve email from the principal (OAuth2User or UserDetails)
        String email = resolveEmail(auth);
        if (email == null) {
            return ResponseEntity.status(400).body(Map.of("error", "Could not resolve email from principal"));
        }

        return userRepository.findByEmail(email)
                .<ResponseEntity<?>>map(user -> ResponseEntity.ok(toDto(user)))
                .orElse(ResponseEntity.status(404).body(Map.of("error", "User not found in database")));
    }


    /**
     * Admin-only: list all registered users.
     */
    @GetMapping("/admin/users")
    public ResponseEntity<List<Map<String, Object>>> listUsers() {
        List<Map<String, Object>> users = userRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    /**
     * Admin-only: update roles for a specific user.
     * Expects a JSON array of role names, e.g., ["ADMIN", "USER"]
     */
    @PutMapping("/admin/users/{id}/roles")
    public ResponseEntity<?> updateRoles(@PathVariable UUID id, @RequestBody List<String> roleNames) {
        return userRepository.findById(Objects.requireNonNull(id)).map(user -> {
            if (user.isAdminProtected() && !roleNames.contains("ADMIN")) {
                return ResponseEntity.status(403).body(Map.of("error", "This administrative account is protected and cannot be revoked."));
            }

            Set<Role> newRoles = roleNames.stream()
                    .map(name -> {
                        try {
                            return Role.valueOf(name.toUpperCase());
                        } catch (IllegalArgumentException e) {
                            return null;
                        }
                    })
                    .filter(role -> role != null)
                    .collect(Collectors.toSet());
            
            // Ensure the user always retains the base USER role as a safeguard
            newRoles.add(Role.USER);
            
            user.setRoles(newRoles);
            User updatedUser = userRepository.save(user);
            System.out.println("### UPDATED ROLES for " + user.getEmail() + " to " + newRoles + " ###");
            return ResponseEntity.ok(toDto(updatedUser));
        }).orElse(ResponseEntity.status(404).body(Map.of("error", "User not found")));
    }


    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /** Tries to get the authenticated user's email from any principal type. */
    private String resolveEmail(Authentication auth) {
        Object principal = auth.getPrincipal();

        // OAuth2 login (Google)
        if (principal instanceof OAuth2User oauth2User) {
            Object raw = oauth2User.getAttributes().get("email");
            if (raw instanceof String s && !s.isBlank()) {
                return s.trim().toLowerCase();
            }
        }

        // Form-login / UserDetails — name is the username (email in our setup)
        String name = auth.getName();
        if (name != null && !name.isBlank()) {
            return name.trim().toLowerCase();
        }

        return null;
    }

    private Map<String, Object> toDto(User user) {
        Set<String> roleNames = user.getRoles()
                .stream()
                .map(Enum::name)
                .collect(Collectors.toSet());
        return Map.of(
                "id",             user.getId().toString(),
                "email",          user.getEmail(),
                "displayName",    user.getDisplayName(),
                "avatarUrl",      user.getAvatarUrl() != null ? user.getAvatarUrl() : "",
                "roles",          roleNames,
                "adminProtected", user.isAdminProtected(),
                "createdAt",      user.getCreatedAt() != null ? user.getCreatedAt().toString() : ""
        );
    }
}
