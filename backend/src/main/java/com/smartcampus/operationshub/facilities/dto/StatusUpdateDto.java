package com.smartcampus.operationshub.facilities.dto;

import com.smartcampus.operationshub.facilities.entity.FacilityStatus;
import jakarta.validation.constraints.NotNull;

public class StatusUpdateDto {

    @NotNull(message = "Status is required")
    private FacilityStatus status;

    public FacilityStatus getStatus() {
        return status;
    }

    public void setStatus(FacilityStatus status) {
        this.status = status;
    }
}
