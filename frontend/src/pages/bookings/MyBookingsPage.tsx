import { useCallback, useEffect, useMemo, useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { CalendarPlus, CircleAlert, XCircle } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { cancelBooking, getMyBookings, type BookingResponse } from "@/api/bookingsApi"
import { exportBookingToICal } from "@/utils/calendarExport"

const STATUS_BADGE: Record<BookingResponse["status"], string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  APPROVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
  CANCELLED: "bg-white/5 text-white/40 border-white/10",
}

function formatDate(iso: string): string {
  const value = new Date(iso)
  return value.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function formatTime(iso: string): string {
  const value = new Date(iso)
  return value.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function MyBookingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [bookings, setBookings] = useState<BookingResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const [showSubmittedBanner, setShowSubmittedBanner] = useState(false)

  const loadBookings = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getMyBookings()
      setBookings(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load bookings")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadBookings()
  }, [loadBookings])

  useEffect(() => {
    const submitted = sessionStorage.getItem("bookingSubmitted")
    if (submitted === "true") {
      sessionStorage.removeItem("bookingSubmitted")
      setShowSubmittedBanner(true)
      const timer = window.setTimeout(() => {
        setShowSubmittedBanner(false)
      }, 3000)
      return () => window.clearTimeout(timer)
    }
    return undefined
  }, [])

  const sortedBookings = useMemo(
    () => [...bookings].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()),
    [bookings],
  )

  if (!user) {
    return <Navigate to="/" replace />
  }

  const onCancel = async (booking: BookingResponse) => {
    const confirmed = window.confirm("Cancel this booking?")
    if (!confirmed) return

    try {
      setCancellingId(booking.id)
      await cancelBooking(booking.id)
      await loadBookings()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to cancel booking")
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div className="min-h-svh bg-[#030303] text-white px-6 py-10 md:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">My Bookings</h1>
            <p className="text-white/60 mt-2">Review and manage your booking requests.</p>
          </div>
          <button
            onClick={() => navigate("/bookings/new")}
            className="inline-flex items-center gap-2 rounded-2xl border border-indigo-500/30 bg-indigo-500/15 px-5 py-3 text-sm font-bold uppercase tracking-widest text-indigo-300 hover:bg-indigo-500/25 transition"
          >
            <CalendarPlus className="h-4 w-4" />
            New Booking
          </button>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400 flex items-center gap-3">
            <CircleAlert className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {showSubmittedBanner && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-emerald-400 flex items-center gap-3">
            <CircleAlert className="h-4 w-4" />
            <span>Booking submitted!</span>
          </div>
        )}

        {isLoading && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <div className="animate-pulse divide-y divide-white/5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="grid grid-cols-7 gap-3 px-4 py-5">
                  {Array.from({ length: 7 }).map((__, j) => (
                    <div key={`${i}-${j}`} className="h-5 rounded bg-white/10" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && sortedBookings.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] px-6 py-12 text-center">
            <XCircle className="h-8 w-8 text-white/40 mx-auto mb-3" />
            <p className="text-white/70 text-lg">No bookings yet. Make your first booking!</p>
          </div>
        )}

        {!isLoading && sortedBookings.length > 0 && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <div className="hidden md:grid grid-cols-[1.2fr_1.4fr_1fr_1fr_0.8fr_0.9fr_0.8fr] gap-3 border-b border-white/10 px-5 py-4 text-xs font-black uppercase tracking-widest text-white/50">
              <span>Facility</span>
              <span>Purpose</span>
              <span>Date</span>
              <span>Time</span>
              <span>Attendees</span>
              <span>Status</span>
              <span>Action</span>
            </div>

            <div className="divide-y divide-white/5">
              {sortedBookings.map((booking) => {
                const canCancel = booking.status === "PENDING" || booking.status === "APPROVED"
                return (
                  <div
                    key={booking.id}
                    className="grid md:grid-cols-[1.2fr_1.4fr_1fr_1fr_0.8fr_0.9fr_0.8fr] gap-3 px-5 py-5 items-center"
                  >
                    <div>
                      <p className="text-sm font-bold text-white">{booking.facilityName ?? `Facility #${booking.facilityId}`}</p>
                      <p className="text-xs text-white/40 md:hidden mt-1">Facility</p>
                    </div>

                    <div>
                      <p className="text-sm text-white/80 line-clamp-2">{booking.purpose}</p>
                      <p className="text-xs text-white/40 md:hidden mt-1">Purpose</p>
                    </div>

                    <div>
                      <p className="text-sm text-white/80">{formatDate(booking.startTime)}</p>
                      <p className="text-xs text-white/40 md:hidden mt-1">Date</p>
                    </div>

                    <div>
                      <p className="text-sm text-white/80">{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</p>
                      <p className="text-xs text-white/40 md:hidden mt-1">Time</p>
                    </div>

                    <div>
                      <p className="text-sm text-white/80">{booking.attendees ?? "-"}</p>
                      <p className="text-xs text-white/40 md:hidden mt-1">Attendees</p>
                    </div>

                    <div>
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest ${STATUS_BADGE[booking.status]}`}>
                        {booking.status}
                      </span>
                    </div>

                    <div>
                      {canCancel ? (
                        <div className="flex items-center gap-2">
                          {booking.status === "APPROVED" && (
                            <button
                              onClick={() => exportBookingToICal(booking)}
                              className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all"
                            >
                              Add to Calendar
                            </button>
                          )}
                          <button
                            disabled={cancellingId === booking.id}
                            onClick={() => void onCancel(booking)}
                            className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-xs font-bold uppercase tracking-widest text-white/80 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            {cancellingId === booking.id ? "Cancelling..." : "Cancel"}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-white/35">-</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
