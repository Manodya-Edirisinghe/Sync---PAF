package com.smartcampus.operationshub.facilities.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcampus.operationshub.facilities.dto.FacilityRequestDto;
import com.smartcampus.operationshub.facilities.dto.FacilityResponseDto;
import com.smartcampus.operationshub.facilities.entity.FacilityStatus;
import com.smartcampus.operationshub.facilities.entity.FacilityType;
import com.smartcampus.operationshub.facilities.exception.FacilityNotFoundException;
import com.smartcampus.operationshub.facilities.service.FacilityService;
import com.smartcampus.operationshub.exception.GlobalExceptionHandler;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class FacilityControllerTest {

    private MockMvc mockMvc;

    @Mock
    private FacilityService facilityService;

    @InjectMocks
    private FacilityController facilityController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(facilityController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    private FacilityResponseDto sampleResponse() {
        FacilityResponseDto dto = new FacilityResponseDto();
        dto.setId(1L);
        dto.setName("Main Lab");
        dto.setType(FacilityType.LAB);
        dto.setCapacity(50);
        dto.setLocation("Building A");
        dto.setStatus(FacilityStatus.ACTIVE);
        dto.setCreatedAt("2026-04-06 09:00:00");
        dto.setUpdatedAt("2026-04-06 09:00:00");
        return dto;
    }

    @Test
    void getAllFacilities_returns200() throws Exception {
        when(facilityService.getAllFacilities()).thenReturn(List.of(sampleResponse()));

        mockMvc.perform(get("/api/v1/facilities"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Main Lab"))
                .andExpect(jsonPath("$[0].type").value("LAB"));
    }

    @Test
    void getFacilityById_found_returns200() throws Exception {
        when(facilityService.getFacilityById(1L)).thenReturn(sampleResponse());

        mockMvc.perform(get("/api/v1/facilities/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Main Lab"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void getFacilityById_notFound_returns404() throws Exception {
        when(facilityService.getFacilityById(999L)).thenThrow(new FacilityNotFoundException(999L));

        mockMvc.perform(get("/api/v1/facilities/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Facility not found with id: 999"));
    }

    @Test
    void createFacility_returns201() throws Exception {
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
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.name").value("New Hall"));
    }

    @Test
    void deleteFacility_returns204() throws Exception {
        doNothing().when(facilityService).deleteFacility(1L);

        mockMvc.perform(delete("/api/v1/facilities/1"))
                .andExpect(status().isNoContent());
    }
}
