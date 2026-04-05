package com.smartcampus.operationshub.facilities.dto;

import com.smartcampus.operationshub.facilities.entity.FacilityStatus;
import com.smartcampus.operationshub.facilities.entity.FacilityType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class FacilityRequestDto {

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Type is required")
    private FacilityType type;

    @Min(value = 1, message = "Capacity must be at least 1")
    private int capacity;

    @NotBlank(message = "Location is required")
    private String location;

    private String availabilityWindows;

    private FacilityStatus status;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public FacilityType getType() {
        return type;
    }

    public void setType(FacilityType type) {
        this.type = type;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getAvailabilityWindows() {
        return availabilityWindows;
    }

    public void setAvailabilityWindows(String availabilityWindows) {
        this.availabilityWindows = availabilityWindows;
    }

    public FacilityStatus getStatus() {
        return status;
    }

    public void setStatus(FacilityStatus status) {
        this.status = status;
    }
}
