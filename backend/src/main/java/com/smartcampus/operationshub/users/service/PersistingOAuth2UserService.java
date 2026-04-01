package com.smartcampus.operationshub.users.service;

import java.util.Objects;
import com.smartcampus.operationshub.common.entity.Notification;
import com.smartcampus.operationshub.common.repository.NotificationRepository;
import com.smartcampus.operationshub.users.entity.Role;
import com.smartcampus.operationshub.users.entity.User;
import com.smartcampus.operationshub.users.repository.UserRepository;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * Loads the Google OAuth2 user, persists/updates the record in Neon PostgreSQL,
 * and returns a custom {@link OAuth2User} whose {@link GrantedAuthority} list
 * is derived from the persisted {@link Role} set — so Spring Security RBAC
 * always reflects the database roles, not Google's scopes.
 */
@Service
@Primary
public class PersistingOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private static final Logger log = LoggerFactory.getLogger(PersistingOAuth2UserService.class);

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final DefaultOAuth2UserService delegate;
    private final String ownerEmail;

    public PersistingOAuth2UserService(UserRepository userRepository, 
                                      NotificationRepository notificationRepository,
                                      @Value("${app.owner-email}") String ownerEmail) {
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.delegate = new DefaultOAuth2UserService();
        this.ownerEmail = ownerEmail;
        log.info("### PersistingOAuth2UserService INSTANTIATED (owner: {}) ###", ownerEmail);
    }

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        try {
            log.info(">>> PersistingOAuth2UserService.loadUser() CALLED");

            OAuth2User oauth2User = delegate.loadUser(userRequest);

            String provider = userRequest.getClientRegistration().getRegistrationId();
            String subjectAttributeName = userRequest.getClientRegistration()
                    .getProviderDetails()
                    .getUserInfoEndpoint()
                    .getUserNameAttributeName();

            String subject     = oauth2User.getAttribute(subjectAttributeName);
            String email       = normalizeEmail(oauth2User.getAttribute("email"));
            String displayName = resolveDisplayName(oauth2User, email);
            String avatarUrl   = oauth2User.getAttribute("picture");

            log.info("Extracted OAuth2 info: provider={}, subject={}, email={}, displayName={}, hasAvatar={}",
                     provider, subject, email, displayName, avatarUrl != null);

            if (!StringUtils.hasText(subject)) {
                throw new OAuth2AuthenticationException(
                        new OAuth2Error("invalid_user_info"), "OAuth subject claim is missing");
            }
            if (!StringUtils.hasText(email)) {
                throw new OAuth2AuthenticationException(
                        new OAuth2Error("invalid_user_info"), "OAuth email claim is missing");
            }

            // --- Upsert the user in Neon DB ---
            Optional<User> byProviderSubject = userRepository.findByOauthProviderAndOauthSubject(provider, subject);
            User user = byProviderSubject
                    .or(() -> userRepository.findByEmail(email))
                    .orElseGet(() -> {
                        log.info("Creating new user for email={}", email);
                        return new User();
                    });

            boolean isNewUser = user.getId() == null;

            user.setEmail(email);
            user.setDisplayName(displayName);
            user.setOauthProvider(provider);
            user.setOauthSubject(subject);
            if (StringUtils.hasText(avatarUrl)) {
                user.setAvatarUrl(avatarUrl);
            }
            if (user.getRoles() == null) {
                user.setRoles(new HashSet<>());
            }
            if (user.getRoles().isEmpty()) {
                user.getRoles().add(Role.USER);
                log.info("Assigned default USER role to new user");
            }

            // --- Apply Protection for Owner ---
            if (email.equalsIgnoreCase(ownerEmail)) {
                user.setAdminProtected(true);
                // Also ensure owner is always an admin
                user.getRoles().add(Role.ADMIN);
            }

            User savedUser = userRepository.save(user);
            log.info("✓ User persisted: id={}, email={}, roles={}, isNew={}",
                     savedUser.getId(), savedUser.getEmail(), savedUser.getRoles(), isNewUser);

            if (isNewUser) {
                Notification regNote = Notification.builder()
                        .message("New user registered: " + savedUser.getEmail())
                        .type("USER_REGISTRATION")
                        .read(false)
                        .build();
                notificationRepository.save(Objects.requireNonNull(regNote));
                log.info("🔔 Notification created for new user registration");
            }

            // --- Build authorities from DB roles ---
            Set<GrantedAuthority> authorities = savedUser.getRoles().stream()
                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                    .collect(Collectors.toSet());

            // --- Return a wrapper so Spring Security uses DB roles ---
            return new DatabaseBackedOAuth2User(oauth2User, authorities, subjectAttributeName);

        } catch (OAuth2AuthenticationException e) {
            throw e;   // re-throw as-is
        } catch (Exception e) {
            log.error("!!! ERROR in PersistingOAuth2UserService.loadUser()", e);
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("user_persistence_error"),
                    "Failed to persist OAuth2 user: " + e.getMessage(),
                    e);
        }
    }

    // -------------------------------------------------------------------------
    // Inner wrapper class
    // -------------------------------------------------------------------------

    /**
     * Wraps the raw {@link OAuth2User} returned by Google and overrides
     * {@link #getAuthorities()} with the roles stored in the database.
     */
    private static final class DatabaseBackedOAuth2User implements OAuth2User {

        private final OAuth2User delegate;
        private final Collection<GrantedAuthority> authorities;
        private final String nameAttributeKey;

        DatabaseBackedOAuth2User(OAuth2User delegate,
                                 Collection<GrantedAuthority> authorities,
                                 String nameAttributeKey) {
            this.delegate         = delegate;
            this.authorities      = List.copyOf(authorities);
            this.nameAttributeKey = nameAttributeKey;
        }

        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() {
            return authorities;
        }

        @Override
        public Map<String, Object> getAttributes() {
            return delegate.getAttributes();
        }

        @Override
        public String getName() {
            Object value = delegate.getAttributes().get(nameAttributeKey);
            return value != null ? value.toString() : delegate.getName();
        }
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private String normalizeEmail(String email) {
        return StringUtils.hasText(email) ? email.trim().toLowerCase() : null;
    }

    private String resolveDisplayName(OAuth2User oauth2User, String email) {
        Object nameObj = oauth2User.getAttribute("name");
        String name = nameObj != null ? nameObj.toString() : null;
        if (StringUtils.hasText(name)) return Objects.requireNonNull(name).trim();
        if (StringUtils.hasText(email)) return email;
        return "Unknown User";
    }
}