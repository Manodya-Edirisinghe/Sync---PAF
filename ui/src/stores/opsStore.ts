import { create } from "zustand";

interface OpsState {
  campus: string;
  kpis: Array<{ label: string; value: string; note: string }>;
  modules: Array<{
    title: string;
    summary: string;
    status: string;
    signal: "good" | "warn" | "urgent";
  }>;
}

export const useOpsStore = create<OpsState>(() => ({
  campus: "Northwood University",
  kpis: [
    { label: "Active resources", value: "148", note: "98% available" },
    { label: "Pending bookings", value: "24", note: "6 awaiting approval" },
    { label: "Open tickets", value: "13", note: "2 critical" },
    { label: "System uptime", value: "99.96%", note: "Last 30 days" },
  ],
  modules: [
    {
      title: "Facilities & Assets",
      summary: "Live inventory, utilization heatmap, and preventive maintenance windows.",
      status: "Stable",
      signal: "good",
    },
    {
      title: "Bookings",
      summary: "Approval queue, conflict detection, and peak-hour optimization.",
      status: "At capacity",
      signal: "warn",
    },
    {
      title: "Incidents",
      summary: "Incident triage, technician routing, and SLA compliance tracking.",
      status: "2 escalations",
      signal: "urgent",
    },
    {
      title: "Users & Access",
      summary: "OAuth2 sessions, role governance, and security posture insights.",
      status: "Secure",
      signal: "good",
    },
  ],
}));
