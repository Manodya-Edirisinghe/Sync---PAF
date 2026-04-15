package com.smartcampus.operationshub.bookings;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcampus.operationshub.bookings.controller.BookingController;
import com.smartcampus.operationshub.bookings.dto.BookingRequest;
import com.smartcampus.operationshub.bookings.dto.BookingResponse;
import com.smartcampus.operationshub.bookings.exception.BookingConflictException;
import com.smartcampus.operationshub.bookings.service.BookingService;
import com.smartcampus.operationshub.exception.GlobalExceptionHandler;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = BookingController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.REGEX,
                pattern = "com\\.smartcampus\\.operationshub\\.config\\.JpaAuditingConfig"
        )
)
@Import({BookingControllerTest.MethodSecurityConfig.class, GlobalExceptionHandler.class})
class BookingControllerTest {

    @EnableMethodSecurity
    static class MethodSecurityConfig {
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BookingService bookingService;

    @Test
    @WithMockUser(username = "user@test.com", roles = "USER")
    void createBooking_returns201() throws Exception {
        BookingRequest request = validRequest();
        when(bookingService.createBooking(any(BookingRequest.class), eq("user@test.com")))
                .thenReturn(responseWithStatus(BookingStatus.PENDING));

        mockMvc.perform(post("/api/v1/bookings")
                        .with(csrf())
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(username = "user@test.com", roles = "USER")
    void createBooking_returns409OnConflict() throws Exception {
        BookingRequest request = validRequest();
        when(bookingService.createBooking(any(BookingRequest.class), eq("user@test.com")))
                .thenThrow(new BookingConflictException());

        mockMvc.perform(post("/api/v1/bookings")
                        .with(csrf())
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    void createBooking_returns401WhenUnauthenticated() throws Exception {
        BookingRequest request = validRequest();

        mockMvc.perform(post("/api/v1/bookings")
                        .with(csrf())
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(result -> {
                    int responseStatus = result.getResponse().getStatus();
                    assertThat(responseStatus).isIn(401, 302);
                });
    }

    @Test
    @WithMockUser(username = "user@test.com", roles = "USER")
    void getMyBookings_returns200() throws Exception {
        when(bookingService.getUserBookings("user@test.com")).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/bookings/me"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void approveBooking_returns200ForAdmin() throws Exception {
        when(bookingService.approveBooking(1L)).thenReturn(responseWithStatus(BookingStatus.APPROVED));

        mockMvc.perform(patch("/api/v1/bookings/1/approve").with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "USER")
    void approveBooking_returns403ForUser() throws Exception {
        mockMvc.perform(patch("/api/v1/bookings/1/approve").with(csrf()))
                .andExpect(status().isForbidden());
    }

    private BookingRequest validRequest() {
        BookingRequest request = new BookingRequest();
        request.setFacilityId(1L);
        request.setStartTime(LocalDateTime.now().plusDays(2));
        request.setEndTime(LocalDateTime.now().plusDays(2).plusHours(2));
        request.setPurpose("Semester workshop booking");
        request.setAttendees(25);
        return request;
    }

    private BookingResponse responseWithStatus(BookingStatus status) {
        BookingResponse response = new BookingResponse();
        response.setId(1L);
        response.setFacilityId(1L);
        response.setFacilityName("Main Hall");
        response.setUserEmail("user@test.com");
        response.setPurpose("Semester workshop booking");
        response.setStartTime(LocalDateTime.now().plusDays(2));
        response.setEndTime(LocalDateTime.now().plusDays(2).plusHours(2));
        response.setStatus(status);
        response.setAttendees(25);
        return response;
    }
}
