package com.smartcampus.operationshub.common.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "global_settings")
@Data
public class GlobalSettings {
    @Id
    private Long id = 1L;

    private boolean notificationsEnabled = true;

    private LocalDateTime bookingSnoozeUntil;
    private LocalDateTime facilitySnoozeUntil;
    private LocalDateTime auditSnoozeUntil;
    private LocalDateTime ticketSnoozeUntil;
}
