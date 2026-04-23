package com.smartcampus.operationshub.common.controller;

import com.smartcampus.operationshub.common.entity.GlobalSettings;
import com.smartcampus.operationshub.common.repository.GlobalSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/settings")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class GlobalSettingsController {

    @Autowired
    private GlobalSettingsRepository repository;

    @GetMapping
    public GlobalSettings getSettings() {
        return repository.findById(1L).orElseGet(() -> {
            GlobalSettings gs = new GlobalSettings();
            gs.setId(1L);
            return repository.save(gs);
        });
    }

    @PutMapping
    public GlobalSettings updateSettings(@RequestBody GlobalSettings updated) {
        GlobalSettings gs = getSettings();
        gs.setNotificationsEnabled(updated.isNotificationsEnabled());
        gs.setBookingSnoozeUntil(updated.getBookingSnoozeUntil());
        gs.setFacilitySnoozeUntil(updated.getFacilitySnoozeUntil());
        gs.setAuditSnoozeUntil(updated.getAuditSnoozeUntil());
        gs.setTicketSnoozeUntil(updated.getTicketSnoozeUntil());
        return repository.save(gs);
    }
}
