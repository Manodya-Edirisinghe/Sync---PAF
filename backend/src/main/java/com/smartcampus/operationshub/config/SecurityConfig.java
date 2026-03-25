package com.smartcampus.operationshub.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
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
import jakarta.servlet.http.HttpServletRequest;

import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        @Value("${app.frontend-url:http://localhost:5173}")
        private String frontendUrl;

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
            ObjectProvider<ClientRegistrationRepository> clientRegistrationRepositoryProvider
    ) throws Exception {
        boolean oauth2Enabled = clientRegistrationRepositoryProvider.getIfAvailable() != null;

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> {
                    auth.requestMatchers("/login", "/api/login", "/error").permitAll();
                    if (oauth2Enabled) {
                        auth.requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll();
                    }
                    auth.anyRequest().authenticated();
                })
                .formLogin(form -> form
                        .defaultSuccessUrl(frontendUrl, true)
                        .permitAll()
                )
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl(frontendUrl)
                        .permitAll()
                )
                .csrf(csrf -> csrf.disable()); // For development only - enable CSRF in production

        if (oauth2Enabled) {
            OAuth2AuthorizationRequestResolver resolver = googleAccountChooserRequestResolver(clientRegistrationRepositoryProvider.getIfAvailable());
            http.oauth2Login(oauth2 -> oauth2
                    .authorizationEndpoint(auth -> auth.authorizationRequestResolver(resolver))
                    .defaultSuccessUrl(frontendUrl, true)
            );
        }

        return http.build();
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
