package com.smartcampus.operationshub.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatsDTO {
    private long userCount;
    private long bookingCount;
    private long incidentCount;
    private long resourceCount;
    private long pendingApprovalCount;
}
