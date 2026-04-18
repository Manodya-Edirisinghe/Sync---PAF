import { useCallback, useEffect, useMemo, useState } from "react"
import {
  approveBooking,
  getAllBookings,
  rejectBooking,
  type BookingResponse,
} from "@/api/bookingsApi"

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"

type StatusFilter = "ALL" | BookingResponse["status"]

interface FacilityOption {
  id: number
  name: string
}

const STATUS_BADGE: Record<BookingResponse["status"], string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  APPROVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
  CANCELLED: "bg-white/5 text-white/40 border-white/10",
}

function formatDateTime(iso: string): string {
  const value = new Date(iso)
  const date = value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  const time = value.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
  return `${date} ${time}`
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingResponse[]>([])
  const [facilities, setFacilities] = useState<FacilityOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadingError, setLoadingError] = useState<string | null>(null)

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL")
  const [facilityFilter, setFacilityFilter] = useState<string>("ALL")

  const [actionBusyId, setActionBusyId] = useState<number | null>(null)
  const [actionErrorById, setActionErrorById] = useState<Record<number, string>>({})

  const [rejectingId, setRejectingId] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [rejectError, setRejectError] = useState<string | null>(null)

  const loadBookings = useCallback(async () => {
    const data = await getAllBookings()
    setBookings(data)
  }, [])

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setLoadingError(null)

      const [bookingData, facilitiesResponse] = await Promise.all([
        getAllBookings(),
        fetch(`${API_BASE}/api/v1/facilities`, { credentials: "include" }),
      ])

      if (!facilitiesResponse.ok) {
        throw new Error("Failed to load facilities")
      }

      const facilitiesData = (await facilitiesResponse.json()) as Array<{
        id: number
        name: string
      }>

      setBookings(bookingData)
      setFacilities(
        facilitiesData
          .map((f) => ({ id: f.id, name: f.name }))
          .sort((a, b) => a.name.localeCompare(b.name)),
      )
    } catch (err: unknown) {
      setLoadingError(err instanceof Error ? err.message : "Failed to load bookings")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const facilityNameById = useMemo(() => {
    const map = new Map<number, string>()
    facilities.forEach((facility) => map.set(facility.id, facility.name))
    return map
  }, [facilities])

  const filteredBookings = useMemo(() => {
    return bookings
      .filter((booking) => {
        const statusMatch = statusFilter === "ALL" || booking.status === statusFilter
        const facilityMatch =
          facilityFilter === "ALL" || booking.facilityId === Number(facilityFilter)
        return statusMatch && facilityMatch
      })
      .sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
      )
  }, [bookings, statusFilter, facilityFilter])

  const onApprove = async (bookingId: number) => {
    try {
      setActionBusyId(bookingId)
      setActionErrorById((prev) => ({ ...prev, [bookingId]: "" }))
      await approveBooking(bookingId)
      await loadBookings()
    } catch (err: unknown) {
      setActionErrorById((prev) => ({
        ...prev,
        [bookingId]: err instanceof Error ? err.message : "Failed to approve booking",
      }))
    } finally {
      setActionBusyId(null)
    }
  }

  const openReject = (bookingId: number) => {
    setRejectingId(bookingId)
    setRejectReason("")
    setRejectError(null)
  }

  const closeReject = () => {
    setRejectingId(null)
    setRejectReason("")
    setRejectError(null)
  }

  const onConfirmReject = async (bookingId: number) => {
    const reason = rejectReason.trim()
    if (reason.length < 5) {
      setRejectError("Rejection reason must be at least 5 characters")
      return
    }

    try {
      setActionBusyId(bookingId)
      setActionErrorById((prev) => ({ ...prev, [bookingId]: "" }))
      setRejectError(null)
      await rejectBooking(bookingId, reason)
      closeReject()
      await loadBookings()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to reject booking"
      setRejectError(message)
      setActionErrorById((prev) => ({ ...prev, [bookingId]: message }))
    } finally {
      setActionBusyId(null)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-3xl font-black tracking-tight uppercase text-white">
          Booking Governance
        </h2>
        <p className="text-white/60">
          Review all booking requests and process approvals or rejections.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="statusFilter"
              className="mb-2 block text-xs font-black uppercase tracking-widest text-white/50"
            >
              Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white outline-none focus:border-indigo-400"
            >
              <option value="ALL" className="bg-[#111]">All</option>
              <option value="PENDING" className="bg-[#111]">PENDING</option>
              <option value="APPROVED" className="bg-[#111]">APPROVED</option>
              <option value="REJECTED" className="bg-[#111]">REJECTED</option>
              <option value="CANCELLED" className="bg-[#111]">CANCELLED</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="facilityFilter"
              className="mb-2 block text-xs font-black uppercase tracking-widest text-white/50"
            >
              Facility
            </label>
            <select
              id="facilityFilter"
              value={facilityFilter}
              onChange={(event) => setFacilityFilter(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white outline-none focus:border-indigo-400"
            >
              <option value="ALL" className="bg-[#111]">All Facilities</option>
              {facilities.map((facility) => (
                <option key={facility.id} value={String(facility.id)} className="bg-[#111]">
                  {facility.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loadingError && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {loadingError}
        </div>
      )}

      <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/[0.02]">
        <table className="min-w-[1200px] w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
              <th className="px-4 py-4">ID</th>
              <th className="px-4 py-4">Facility</th>
              <th className="px-4 py-4">User Email</th>
              <th className="px-4 py-4">Purpose</th>
              <th className="px-4 py-4">Start</th>
              <th className="px-4 py-4">End</th>
              <th className="px-4 py-4">Attendees</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            {isLoading &&
              Array.from({ length: 6 }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`} className="animate-pulse">
                  {Array.from({ length: 9 }).map((__, colIndex) => (
                    <td key={`sk-${rowIndex}-${colIndex}`} className="px-4 py-5">
                      <div className="h-4 rounded bg-white/10" />
                    </td>
                  ))}
                </tr>
              ))}

            {!isLoading && filteredBookings.length === 0 && (
              <tr>
                <td colSpan={9} className="px-6 py-14 text-center text-white/50 font-semibold">
                  No bookings found
                </td>
              </tr>
            )}

            {!isLoading &&
              filteredBookings.map((booking) => {
                const facilityLabel =
                  booking.facilityName ||
                  facilityNameById.get(booking.facilityId) ||
                  `Facility #${booking.facilityId}`
                const actionError = actionErrorById[booking.id]

                return (
                  <tr key={booking.id} className="align-top">
                    <td className="px-4 py-5 text-sm text-white/80">#{booking.id}</td>
                    <td className="px-4 py-5 text-sm font-semibold text-white">{facilityLabel}</td>
                    <td className="px-4 py-5 text-sm text-white/80">{booking.userEmail}</td>
                    <td className="px-4 py-5 text-sm text-white/80 max-w-xs">
                      <p className="line-clamp-3">{booking.purpose}</p>
                    </td>
                    <td className="px-4 py-5 text-sm text-white/70">{formatDateTime(booking.startTime)}</td>
                    <td className="px-4 py-5 text-sm text-white/70">{formatDateTime(booking.endTime)}</td>
                    <td className="px-4 py-5 text-sm text-white/80">{booking.attendees ?? "-"}</td>
                    <td className="px-4 py-5">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest ${STATUS_BADGE[booking.status]}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex flex-col gap-2">
                        {(booking.status === "PENDING" || booking.status === "APPROVED") && (
                          <div className="flex items-center gap-2">
                            {booking.status === "PENDING" && (
                              <button
                                type="button"
                                disabled={actionBusyId === booking.id}
                                onClick={() => void onApprove(booking.id)}
                                className="rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Approve
                              </button>
                            )}

                            <button
                              type="button"
                              disabled={actionBusyId === booking.id}
                              onClick={() => openReject(booking.id)}
                              className="rounded-lg border border-red-500/30 bg-red-500/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-300 hover:bg-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Reject
                            </button>
                          </div>
                        )}

                        {(booking.status === "REJECTED" || booking.status === "CANCELLED") && (
                          <span className="text-xs text-white/35">-</span>
                        )}

                        {actionError && (
                          <p className="text-xs text-red-300 max-w-xs">{actionError}</p>
                        )}

                        {rejectingId === booking.id && (
                          <div className="mt-1 rounded-xl border border-red-500/30 bg-[#120707] p-3 space-y-2 max-w-sm">
                            <textarea
                              value={rejectReason}
                              onChange={(event) => {
                                setRejectReason(event.target.value)
                                setRejectError(null)
                              }}
                              rows={3}
                              placeholder="Enter rejection reason"
                              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-red-400"
                            />
                            {rejectError && (
                              <p className="text-xs text-red-300">{rejectError}</p>
                            )}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                disabled={actionBusyId === booking.id}
                                onClick={() => void onConfirmReject(booking.id)}
                                className="rounded-lg border border-red-500/40 bg-red-500/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-200 hover:bg-red-500/30 disabled:opacity-50"
                              >
                                Confirm Reject
                              </button>
                              <button
                                type="button"
                                disabled={actionBusyId === booking.id}
                                onClick={closeReject}
                                className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/70 hover:bg-white/10 disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
