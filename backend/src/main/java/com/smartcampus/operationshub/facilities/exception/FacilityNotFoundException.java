package com.smartcampus.operationshub.facilities.exception;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class FacilityNotFoundException extends RuntimeException {

    public FacilityNotFoundException(UUID id) {
        super("Facility not found with id: " + id);
    }
}
