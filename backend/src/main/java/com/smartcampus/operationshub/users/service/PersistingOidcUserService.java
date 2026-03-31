package com.smartcampus.operationshub.users.service;

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
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * Loads the Google OIDC user, persists/updates the record in Neon PostgreSQL,
 * and returns a custom {@link OidcUser} whose {@link GrantedAuthority} list
 * is derived from the persisted {@link Role} set — so Spring Security RBAC
 * always reflects the database roles, not Google's scopes.
 */
@Service
@Primary
public class PersistingOidcUserService extends OidcUserService {

    private static final Logger log = LoggerFactory.getLogger(PersistingOidcUserService.class);

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    public PersistingOidcUserService(UserRepository userRepository, NotificationRepository notificationRepository) {
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        log.info("### PersistingOidcUserService INSTANTIATED ###");
    }

    @Override
    @Transactional
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        try {
            log.info(">>> PersistingOidcUserService.loadUser() CALLED");

            OidcUser oidcUser = super.loadUser(userRequest);

            String provider = userRequest.getClientRegistration().getRegistrationId();
            String subjectAttributeName = userRequest.getClientRegistration()
                    .getProviderDetails()
                    .getUserInfoEndpoint()
                    .getUserNameAttributeName();

            String subject     = oidcUser.getSubject();
            String email       = normalizeEmail(oidcUser.getEmail());
            String displayName = resolveDisplayName(oidcUser, email);
            String avatarUrl   = oidcUser.getPicture();

            log.info("Extracted OIDC info: provider={}, subject={}, email={}, displayName={}, hasAvatar={}",
                     provider, subject, email, displayName, avatarUrl != null);

            if (!StringUtils.hasText(subject)) {
                throw new OAuth2AuthenticationException(
                        new OAuth2Error("invalid_user_info"), "OIDC subject claim is missing");
            }
            if (!StringUtils.hasText(email)) {
                throw new OAuth2AuthenticationException(
                        new OAuth2Error("invalid_user_info"), "OIDC email claim is missing");
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

            User savedUser = userRepository.save(user);
            log.info("✓ User persisted: id={}, email={}, roles={}, isNew={}",
                     savedUser.getId(), savedUser.getEmail(), savedUser.getRoles(), isNewUser);

            if (isNewUser) {
                notificationRepository.save(Notification.builder()
                        .message("New user registered: " + savedUser.getEmail())
                        .type("USER_REGISTRATION")
                        .read(false)
                        .build());
                log.info("🔔 Notification created for new user registration (OIDC)");
            }

            // --- Build authorities from DB roles ---
            Set<GrantedAuthority> authorities = savedUser.getRoles().stream()
                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                    .collect(Collectors.toSet());

            // --- Return a wrapper so Spring Security uses DB roles ---
            return new DatabaseBackedOidcUser(oidcUser, authorities, subjectAttributeName);

        } catch (OAuth2AuthenticationException e) {
            throw e;   // re-throw as-is
        } catch (Exception e) {
            log.error("!!! ERROR in PersistingOidcUserService.loadUser()", e);
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("user_persistence_error"),
                    "Failed to persist OIDC user: " + e.getMessage(),
                    e);
        }
    }

    // -------------------------------------------------------------------------
    // Inner wrapper class
    // -------------------------------------------------------------------------

    /**
     * Wraps the raw {@link OidcUser} returned by Google and overrides
     * {@link #getAuthorities()} with the roles stored in the database.
     */
    private static final class DatabaseBackedOidcUser implements OidcUser, java.io.Serializable {

        private final OidcUser delegate;
        private final Collection<GrantedAuthority> authorities;
        private final String nameAttributeKey;

        DatabaseBackedOidcUser(OidcUser delegate,
                               Collection<GrantedAuthority> authorities,
                               String nameAttributeKey) {
            this.delegate         = delegate;
            this.authorities      = List.copyOf(authorities);
            this.nameAttributeKey = nameAttributeKey;
        }

        @Override
        public Map<String, Object> getClaims() {
            return delegate.getClaims();
        }

        @Override
        public OidcUserInfo getUserInfo() {
            return delegate.getUserInfo();
        }

        @Override
        public OidcIdToken getIdToken() {
            return delegate.getIdToken();
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
            if (nameAttributeKey != null) {
                Object value = delegate.getAttributes().get(nameAttributeKey);
                if (value != null) {
                    return value.toString();
                }
            }
            return delegate.getName();
        }
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private String normalizeEmail(String email) {
        return StringUtils.hasText(email) ? email.trim().toLowerCase() : null;
    }

    private String resolveDisplayName(OidcUser oidcUser, String email) {
        String name = oidcUser.getFullName();
        if (StringUtils.hasText(name)) return name.trim();
        if (StringUtils.hasText(email)) return email;
        return "Unknown User";
    }
}
