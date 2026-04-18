package com.smartcampus.operationshub.facilities.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcampus.operationshub.facilities.dto.FacilityRequestDto;
import com.smartcampus.operationshub.facilities.dto.FacilityResponseDto;
import com.smartcampus.operationshub.facilities.entity.FacilityStatus;
import com.smartcampus.operationshub.facilities.entity.FacilityType;
import com.smartcampus.operationshub.facilities.service.FacilityService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
    controllers = FacilityController.class,
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.REGEX,
        pattern = "com\\.smartcampus\\.operationshub\\.config\\.JpaAuditingConfig"
    )
)
@Import(FacilityControllerSecurityTest.MethodSecurityConfig.class)
class FacilityControllerSecurityTest {

    @EnableMethodSecurity
    static class MethodSecurityConfig {}


    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FacilityService facilityService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "ADMIN")
    void createFacility_asAdmin_returns201() throws Exception {
        FacilityRequestDto request = new FacilityRequestDto();
        request.setName("New Hall");
        request.setType(FacilityType.LECTURE_HALL);
        request.setCapacity(200);
        request.setLocation("Building B");

        FacilityResponseDto response = new FacilityResponseDto();
        response.setId(2L);
        response.setName("New Hall");
        response.setType(FacilityType.LECTURE_HALL);
        response.setCapacity(200);
        response.setLocation("Building B");
        response.setStatus(FacilityStatus.ACTIVE);

        when(facilityService.createFacility(any(FacilityRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/facilities")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.name").value("New Hall"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void createFacility_asUser_returns403() throws Exception {
        FacilityRequestDto request = new FacilityRequestDto();
        request.setName("Blocked");
        request.setType(FacilityType.LAB);
        request.setCapacity(10);
        request.setLocation("X");

        mockMvc.perform(post("/api/v1/facilities")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteFacility_asAdmin_returns204() throws Exception {
        doNothing().when(facilityService).deleteFacility(1L);

        mockMvc.perform(delete("/api/v1/facilities/1").with(csrf()))
                .andExpect(status().isNoContent());
    }
}
