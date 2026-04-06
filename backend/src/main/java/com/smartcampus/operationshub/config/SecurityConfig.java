package com.smartcampus.operationshub.config;

import com.smartcampus.operationshub.users.service.PersistingOAuth2UserService;
import com.smartcampus.operationshub.users.service.PersistingOidcUserService;
import java.util.HashMap;
import java.util.Map;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret:}")
    private String googleClientSecret;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder passwordEncoder) {
        UserDetails admin = User.builder()
                .username("admin")
                .password(passwordEncoder.encode("admin123"))
                .roles("ADMIN", "USER")
                .build();

        UserDetails user = User.builder()
                .username("user")
                .password(passwordEncoder.encode("user123"))
                .roles("USER")
                .build();

        UserDetails technician = User.builder()
                .username("technician")
                .password(passwordEncoder.encode("tech123"))
                .roles("TECHNICIAN", "USER")
                .build();

        return new InMemoryUserDetailsManager(admin, user, technician);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(java.util.List.of("http://localhost:5173", "http://localhost:5174"));
        configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(java.util.List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            ObjectProvider<ClientRegistrationRepository> clientRegistrationRepositoryProvider,
            PersistingOAuth2UserService persistingOAuth2UserService,
            PersistingOidcUserService persistingOidcUserService,
            OAuthSuccessHandler oauthSuccessHandler,
            HttpCookieOAuth2AuthorizationRequestRepository cookieAuthorizationRequestRepository
    ) throws Exception {
        boolean oauth2Enabled = clientRegistrationRepositoryProvider.getIfAvailable() != null;
        boolean oauth2CredentialsConfigured = hasValidGoogleOauthCredentials();

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> {
                    // Public routes
                    auth.requestMatchers("/", "/login", "/api/login", "/error", "/oauth2/callback").permitAll();
                    if (oauth2Enabled && oauth2CredentialsConfigured) {
                        auth.requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll();
                    }
                    // Role-based access control
                    auth.requestMatchers("/api/admin/**").hasRole("ADMIN");
                    auth.requestMatchers("/api/technician/**").hasAnyRole("TECHNICIAN", "ADMIN");
                    // Everything else requires authentication
                    auth.anyRequest().authenticated();
                })
                .httpBasic(basic -> {})
                .formLogin(form -> form
                        .defaultSuccessUrl(frontendUrl + "/dashboard", true)
                        .permitAll()
                )
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl(frontendUrl)
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID")
                        .permitAll()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            if (request.getRequestURI().startsWith("/api/")) {
                                response.setStatus(401);
                                response.setContentType("application/json");
                                response.getWriter().write("{\"error\": \"Unauthorized\"}");
                            } else {
                                response.sendRedirect("/login");
                            }
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            if (request.getRequestURI().startsWith("/api/")) {
                                response.setStatus(403);
                                response.setContentType("application/json");
                                response.getWriter().write("{\"error\": \"Forbidden\"}");
                            } else {
                                response.sendRedirect("/login");
                            }
                        })
                )
                .csrf(csrf -> csrf.disable()); // Disable CSRF for API usage; re-enable in production

        if (oauth2Enabled && oauth2CredentialsConfigured) {
            String idStatus = (googleClientId == null || googleClientId.isEmpty()) 
                ? "NOT LOADED (EMPTY)" 
                : "LOADED (Len: " + googleClientId.length() + ", Starts with: " + googleClientId.substring(0, Math.min(5, googleClientId.length())) + "...)";
            log.info("### Google OAuth Client ID {}: ###", idStatus);
            
            log.info("### Configuring OAuth2 login with custom PersistingOAuth2UserService ###");
            OAuth2AuthorizationRequestResolver resolver = googleAccountChooserRequestResolver(clientRegistrationRepositoryProvider.getIfAvailable());
            http.oauth2Login(oauth2 -> {
                oauth2.authorizationEndpoint(auth -> {
                    auth.authorizationRequestResolver(resolver);
                    auth.authorizationRequestRepository(cookieAuthorizationRequestRepository);
                });
                oauth2.userInfoEndpoint(userInfo -> {
                    userInfo.userService(persistingOAuth2UserService);
                    userInfo.oidcUserService(persistingOidcUserService);
                });
                oauth2.successHandler(oauthSuccessHandler);
            });
        } else if (oauth2Enabled) {
            log.warn("Google OAuth is disabled for this run because client credentials are missing or placeholder values.");
            log.warn("Set SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_ID and SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_SECRET in .env");
        }

        return http.build();
    }

    private boolean hasValidGoogleOauthCredentials() {
        return isConfigured(googleClientId)
                && isConfigured(googleClientSecret)
                && !googleClientId.toLowerCase().contains("local-dev-google-client-id")
                && !googleClientSecret.toLowerCase().contains("local-dev-google-client-secret")
                && !googleClientId.toLowerCase().contains("your-google-client-id-here")
                && !googleClientSecret.toLowerCase().contains("your-google-client-secret-here");
    }

    private boolean isConfigured(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private OAuth2AuthorizationRequestResolver googleAccountChooserRequestResolver(
            ClientRegistrationRepository clientRegistrationRepository
    ) {
        DefaultOAuth2AuthorizationRequestResolver defaultResolver =
                new DefaultOAuth2AuthorizationRequestResolver(clientRegistrationRepository, "/oauth2/authorization");

        return new OAuth2AuthorizationRequestResolver() {
            @Override
            public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
                return withAccountChooser(defaultResolver.resolve(request));
            }

            @Override
            public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
                return withAccountChooser(defaultResolver.resolve(request, clientRegistrationId));
            }

            private OAuth2AuthorizationRequest withAccountChooser(OAuth2AuthorizationRequest authRequest) {
                if (authRequest == null) {
                    return null;
                }
                Map<String, Object> params = new HashMap<>(authRequest.getAdditionalParameters());
                params.put("prompt", "select_account");
                return OAuth2AuthorizationRequest.from(authRequest)
                        .additionalParameters(params)
                        .build();
            }
        };
    }
}
