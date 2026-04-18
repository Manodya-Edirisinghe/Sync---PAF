import type { BookingResponse } from "@/api/bookingsApi"

function formatLocalDateTime(isoString: string): string {
  // strips hyphens, colons, dots from "2026-05-01T10:00:00"
  // returns "20260501T100000"
  return isoString.replace(/[-:]/g, "").split(".")[0]
}

function formatUTCNow(): string {
  // returns current UTC time as "20260501T083000Z"
  return new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
}

export function exportBookingToICal(booking: BookingResponse): void {
  const dtStart = formatLocalDateTime(booking.startTime)
  const dtEnd = formatLocalDateTime(booking.endTime)
  const dtStamp = formatUTCNow()
  const attendees = booking.attendees ?? "Not specified"
  const safeFacilityName = booking.facilityName.replace(/\s+/g, "_")

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Smart Campus Operations Hub//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${booking.id}-${booking.userEmail}@smartcampus`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:Booking - ${booking.facilityName}`,
    `DESCRIPTION:Purpose: ${booking.purpose}\\nAttendees: ${attendees}\\nBooking ID: ${booking.id}`,
    `LOCATION:${booking.facilityName}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n")

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = `booking-${booking.id}-${safeFacilityName}.ics`
  link.style.display = "none"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
