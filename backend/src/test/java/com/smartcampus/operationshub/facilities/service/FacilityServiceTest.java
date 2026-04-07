package com.smartcampus.operationshub.facilities.service;

import com.smartcampus.operationshub.common.entity.Notification;
import com.smartcampus.operationshub.common.repository.NotificationRepository;
import com.smartcampus.operationshub.facilities.dto.FacilityRequestDto;
import com.smartcampus.operationshub.facilities.dto.FacilityResponseDto;
import com.smartcampus.operationshub.facilities.entity.Facility;
import com.smartcampus.operationshub.facilities.entity.FacilityStatus;
import com.smartcampus.operationshub.facilities.entity.FacilityType;
import com.smartcampus.operationshub.facilities.exception.FacilityNotFoundException;
import com.smartcampus.operationshub.facilities.repository.FacilityRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FacilityServiceTest {

    @Mock
    private FacilityRepository facilityRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private FacilityServiceImpl facilityService;

    private Facility sampleFacility;

    @BeforeEach
    void setUp() {
        sampleFacility = new Facility();
        sampleFacility.setId(1L);
        sampleFacility.setName("Main Lab");
        sampleFacility.setType(FacilityType.LAB);
        sampleFacility.setCapacity(50);
        sampleFacility.setLocation("Building A");
        sampleFacility.setAvailabilityWindows("Mon-Fri 08:00-18:00");
        sampleFacility.setStatus(FacilityStatus.ACTIVE);
    }

    @Test
    void getAllFacilities_returnsList() {
        when(facilityRepository.findAll()).thenReturn(List.of(sampleFacility));

        List<FacilityResponseDto> result = facilityService.getAllFacilities();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Main Lab");
        assertThat(result.get(0).getType()).isEqualTo(FacilityType.LAB);
    }

    @Test
    void getFacilityById_found_returnsDto() {
        when(facilityRepository.findById(1L)).thenReturn(Optional.of(sampleFacility));

        FacilityResponseDto result = facilityService.getFacilityById(1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Main Lab");
        assertThat(result.getCapacity()).isEqualTo(50);
        assertThat(result.getStatus()).isEqualTo(FacilityStatus.ACTIVE);
    }

    @Test
    void getFacilityById_notFound_throwsException() {
        when(facilityRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> facilityService.getFacilityById(999L))
                .isInstanceOf(FacilityNotFoundException.class)
                .hasMessageContaining("999");
    }

    @Test
    void createFacility_savesAndReturnsDto() {
        FacilityRequestDto dto = new FacilityRequestDto();
        dto.setName("New Hall");
        dto.setType(FacilityType.LECTURE_HALL);
        dto.setCapacity(200);
        dto.setLocation("Building B");

        Facility saved = new Facility();
        saved.setId(2L);
        saved.setName("New Hall");
        saved.setType(FacilityType.LECTURE_HALL);
        saved.setCapacity(200);
        saved.setLocation("Building B");
        saved.setStatus(FacilityStatus.ACTIVE);

        when(facilityRepository.save(any(Facility.class))).thenReturn(saved);

        FacilityResponseDto result = facilityService.createFacility(dto);

        assertThat(result.getId()).isEqualTo(2L);
        assertThat(result.getName()).isEqualTo("New Hall");
        assertThat(result.getStatus()).isEqualTo(FacilityStatus.ACTIVE);
        verify(facilityRepository).save(any(Facility.class));
        verify(notificationRepository).save(argThat((Notification n) ->
                n.getType().equals("FACILITY_CREATED")
                        && n.getMessage().contains("New Hall")));
    }

    @Test
    void updateFacilityStatus_changesStatusCorrectly() {
        when(facilityRepository.findById(1L)).thenReturn(Optional.of(sampleFacility));

        Facility updated = new Facility();
        updated.setId(1L);
        updated.setName("Main Lab");
        updated.setType(FacilityType.LAB);
        updated.setCapacity(50);
        updated.setLocation("Building A");
        updated.setStatus(FacilityStatus.OUT_OF_SERVICE);

        when(facilityRepository.save(any(Facility.class))).thenReturn(updated);

        FacilityResponseDto result = facilityService.updateFacilityStatus(1L, FacilityStatus.OUT_OF_SERVICE);

        assertThat(result.getStatus()).isEqualTo(FacilityStatus.OUT_OF_SERVICE);
        verify(facilityRepository).save(any(Facility.class));
        verify(notificationRepository).save(argThat((Notification n) ->
                n.getType().equals("FACILITY_STATUS_UPDATED")
                        && n.getMessage().contains("OUT_OF_SERVICE")));
    }

    @Test
    void deleteFacility_success_savesNotification() {
        when(facilityRepository.findById(1L)).thenReturn(Optional.of(sampleFacility));

        assertThatCode(() -> facilityService.deleteFacility(1L)).doesNotThrowAnyException();

        verify(facilityRepository).delete(sampleFacility);
        verify(notificationRepository).save(argThat((Notification n) ->
                n.getType().equals("FACILITY_DELETED")
                        && n.getMessage().contains("id 1")));
    }

    @Test
    void deleteFacility_notFound_throwsException() {
        when(facilityRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> facilityService.deleteFacility(999L))
                .isInstanceOf(FacilityNotFoundException.class)
                .hasMessageContaining("999");
    }
}
