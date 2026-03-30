package com.smartcampus.operationshub.config;

import java.io.IOException;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
public class OAuthSuccessHandler implements AuthenticationSuccessHandler {

    private static final Logger log = LoggerFactory.getLogger(OAuthSuccessHandler.class);

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {
        log.info("Authentication SUCCESS. Principal: {}", authentication.getPrincipal());
        log.info("Authorities: {}", authentication.getAuthorities());
        String dashboardUrl = frontendUrl.replaceAll("/$", "") + "/oauth2/callback";
        log.info("Redirecting to dashboard: {}", dashboardUrl);
        response.sendRedirect(dashboardUrl);
    }
}
