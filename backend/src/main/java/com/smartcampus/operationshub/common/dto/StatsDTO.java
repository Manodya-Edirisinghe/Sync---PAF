package com.smartcampus.operationshub.common.dto;

public class StatsDTO {
    private long userCount;
    private long bookingCount;
    private long incidentCount;
    private long resourceCount;
    private long pendingApprovalCount;

    // No-Arg Constructor
    public StatsDTO() {}

    // All-Args Constructor
    public StatsDTO(long userCount, long bookingCount, long incidentCount, long resourceCount, long pendingApprovalCount) {
        this.userCount = userCount;
        this.bookingCount = bookingCount;
        this.incidentCount = incidentCount;
        this.resourceCount = resourceCount;
        this.pendingApprovalCount = pendingApprovalCount;
    }

    // Getters and Setters
    public long getUserCount() { return userCount; }
    public void setUserCount(long userCount) { this.userCount = userCount; }

    public long getBookingCount() { return bookingCount; }
    public void setBookingCount(long bookingCount) { this.bookingCount = bookingCount; }

    public long getIncidentCount() { return incidentCount; }
    public void setIncidentCount(long incidentCount) { this.incidentCount = incidentCount; }

    public long getResourceCount() { return resourceCount; }
    public void setResourceCount(long resourceCount) { this.resourceCount = resourceCount; }

    public long getPendingApprovalCount() { return pendingApprovalCount; }
    public void setPendingApprovalCount(long pendingApprovalCount) { this.pendingApprovalCount = pendingApprovalCount; }

    // Manual Builder Pattern
    public static StatsDTOBuilder builder() {
        return new StatsDTOBuilder();
    }

    public static class StatsDTOBuilder {
        private long userCount;
        private long bookingCount;
        private long incidentCount;
        private long resourceCount;
        private long pendingApprovalCount;

        public StatsDTOBuilder userCount(long userCount) { this.userCount = userCount; return this; }
        public StatsDTOBuilder bookingCount(long bookingCount) { this.bookingCount = bookingCount; return this; }
        public StatsDTOBuilder incidentCount(long incidentCount) { this.incidentCount = incidentCount; return this; }
        public StatsDTOBuilder resourceCount(long resourceCount) { this.resourceCount = resourceCount; return this; }
        public StatsDTOBuilder pendingApprovalCount(long pendingApprovalCount) { this.pendingApprovalCount = pendingApprovalCount; return this; }

        public StatsDTO build() {
            return new StatsDTO(userCount, bookingCount, incidentCount, resourceCount, pendingApprovalCount);
        }
    }
}
