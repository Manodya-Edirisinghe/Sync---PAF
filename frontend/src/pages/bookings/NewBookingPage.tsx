import { useMemo, useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { CircleAlert, Loader2 } from "lucide-react"
import { createBooking, ApiError } from "@/api/bookingsApi"

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"

interface FacilityOption {
  id: number
  name: string
  type: string
  location: string
  status: string
  capacity: number
  availabilityWindows?: string | null
}

interface FormState {
  facilityId: string
  date: string
  startTime: string
  endTime: string
  purpose: string
  attendees: string
}

interface FormErrors {
  facilityId?: string
  date?: string
  startTime?: string
  endTime?: string
  purpose?: string
  attendees?: string
}

function todayIsoDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function toIsoLocalDateTime(date: string, time: string): string {
  return `${date}T${time}:00`
}

export default function NewBookingPage() {
  const navigate = useNavigate()

  const [facilities, setFacilities] = useState<FacilityOption[]>([])
  const [isLoadingFacilities, setIsLoadingFacilities] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [alertMessage, setAlertMessage] = useState<string | null>(null)

  const [form, setForm] = useState<FormState>({
    facilityId: "",
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
    attendees: "",
  })

  const minDate = useMemo(() => todayIsoDate(), [])
  const selectedFacility = useMemo(
    () => facilities.find((facility) => String(facility.id) === form.facilityId),
    [facilities, form.facilityId],
  )
  const attendeesCount = useMemo(() => Number(form.attendees), [form.attendees])
  const hasDateAndTime = useMemo(
    () => Boolean(form.date && form.startTime && form.endTime),
    [form.date, form.startTime, form.endTime],
  )
  const showCapacityWarning = useMemo(
    () =>
      Boolean(
        selectedFacility &&
          form.attendees &&
          hasDateAndTime &&
          Number.isFinite(attendeesCount) &&
          attendeesCount > selectedFacility.capacity,
      ),
    [selectedFacility, form.attendees, hasDateAndTime, attendeesCount],
  )
  const showAvailabilityHint = useMemo(
    () => Boolean(selectedFacility?.availabilityWindows?.trim()),
    [selectedFacility],
  )

  useEffect(() => {
    const loadFacilities = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/v1/facilities`, {
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Failed to load facilities")
        }

        const data = (await response.json()) as FacilityOption[]
        setFacilities(data.filter((facility) => facility.status === "ACTIVE"))
      } catch {
        setAlertMessage("Something went wrong. Please try again.")
      } finally {
        setIsLoadingFacilities(false)
      }
    }

    void loadFacilities()
  }, [])

  const validate = (state: FormState): FormErrors => {
    const nextErrors: FormErrors = {}

    if (!state.facilityId) {
      nextErrors.facilityId = "Facility is required"
    }

    if (!state.date) {
      nextErrors.date = "Date is required"
    } else if (state.date < minDate) {
      nextErrors.date = "Date must not be in the past"
    }

    if (!state.startTime) {
      nextErrors.startTime = "Start time is required"
    }

    if (!state.endTime) {
      nextErrors.endTime = "End time is required"
    }

    if (state.startTime && state.endTime && state.endTime <= state.startTime) {
      nextErrors.endTime = "End time must be after start time"
    }

    const trimmedPurpose = state.purpose.trim()
    if (!trimmedPurpose) {
      nextErrors.purpose = "Purpose is required"
    } else if (trimmedPurpose.length < 10) {
      nextErrors.purpose = "Purpose must be at least 10 characters"
    }

    if (state.attendees) {
      const attendees = Number(state.attendees)
      if (Number.isNaN(attendees) || attendees < 1) {
        nextErrors.attendees = "Attendees must be 1 or greater"
      }
    }

    return nextErrors
  }

  const updateField = (field: keyof FormState, value: string) => {
    const nextForm = { ...form, [field]: value }
    setForm(nextForm)
    if (submitAttempted) {
      setErrors(validate(nextForm))
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitAttempted(true)
    setAlertMessage(null)

    const validationErrors = validate(form)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    try {
      setIsSubmitting(true)

      await createBooking({
        facilityId: Number(form.facilityId),
        startTime: toIsoLocalDateTime(form.date, form.startTime),
        endTime: toIsoLocalDateTime(form.date, form.endTime),
        purpose: form.purpose.trim(),
        attendees: form.attendees ? Number(form.attendees) : undefined,
      })

      sessionStorage.setItem("bookingSubmitted", "true")
      navigate("/bookings/my")
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 409) {
        setAlertMessage("This facility is already booked for the selected time. Please choose a different time slot.")
      } else {
        setAlertMessage("Something went wrong. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-svh bg-[#030303] text-white px-6 py-10 md:px-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          to="/bookings/my"
          className="inline-flex items-center text-sm text-white/60 hover:text-white transition"
        >
          {"< "}Back to My Bookings
        </Link>

        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Request New Booking</h1>
          <p className="text-white/60 mt-2">Fill in the details below to submit your booking request.</p>

          {alertMessage && (
            <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400 flex items-start gap-3">
              <CircleAlert className="h-4 w-4 mt-0.5" />
              <span>{alertMessage}</span>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="facilityId" className="block text-sm font-bold text-white/80 mb-2">
                Facility
              </label>
              <select
                id="facilityId"
                value={form.facilityId}
                onChange={(e) => updateField("facilityId", e.target.value)}
                disabled={isLoadingFacilities}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-white outline-none focus:border-indigo-400"
              >
                <option value="" className="bg-[#111]">{isLoadingFacilities ? "Loading facilities..." : "Select a facility"}</option>
                {facilities.map((facility) => (
                  <option key={facility.id} value={facility.id} className="bg-[#111]">
                    {facility.name} - {facility.type} ({facility.location})
                  </option>
                ))}
              </select>
              {errors.facilityId && <p className="mt-2 text-sm text-red-400">{errors.facilityId}</p>}

              {showAvailabilityHint && (
                <div className="mt-3 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-xl p-3">
                  <p>ℹ This facility is available: {selectedFacility?.availabilityWindows}</p>
                </div>
              )}
            </div>

            {showCapacityWarning && selectedFacility && (
              <div className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-xl p-3">
                <p>
                  ⚠ Expected attendees ({attendeesCount}) exceeds this facility&apos;s capacity ({selectedFacility.capacity}).
                  Your request will be reviewed by an admin.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-bold text-white/80 mb-2">Date</label>
                <input
                  id="date"
                  type="date"
                  min={minDate}
                  value={form.date}
                  onChange={(e) => updateField("date", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-white outline-none focus:border-indigo-400"
                />
                {errors.date && <p className="mt-2 text-sm text-red-400">{errors.date}</p>}
              </div>

              <div>
                <label htmlFor="startTime" className="block text-sm font-bold text-white/80 mb-2">Start time</label>
                <input
                  id="startTime"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => updateField("startTime", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-white outline-none focus:border-indigo-400"
                />
                {errors.startTime && <p className="mt-2 text-sm text-red-400">{errors.startTime}</p>}
              </div>

              <div>
                <label htmlFor="endTime" className="block text-sm font-bold text-white/80 mb-2">End time</label>
                <input
                  id="endTime"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => updateField("endTime", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-white outline-none focus:border-indigo-400"
                />
                {errors.endTime && <p className="mt-2 text-sm text-red-400">{errors.endTime}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="purpose" className="block text-sm font-bold text-white/80 mb-2">Purpose</label>
              <textarea
                id="purpose"
                rows={3}
                maxLength={500}
                value={form.purpose}
                onChange={(e) => updateField("purpose", e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-white outline-none focus:border-indigo-400 resize-y"
              />
              <div className="mt-2 flex items-center justify-between">
                {errors.purpose ? <p className="text-sm text-red-400">{errors.purpose}</p> : <span />}
                <p className="text-xs text-white/40">{form.purpose.length}/500</p>
              </div>
            </div>

            <div>
              <label htmlFor="attendees" className="block text-sm font-bold text-white/80 mb-2">Expected attendees</label>
              <input
                id="attendees"
                type="number"
                min={1}
                value={form.attendees}
                onChange={(e) => updateField("attendees", e.target.value)}
                placeholder="Optional"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-white outline-none focus:border-indigo-400"
              />
              {errors.attendees && <p className="mt-2 text-sm text-red-400">{errors.attendees}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto md:min-w-64 inline-flex items-center justify-center gap-2 rounded-2xl border border-indigo-500/30 bg-indigo-500/20 px-6 py-3 text-sm font-bold uppercase tracking-widest text-indigo-200 hover:bg-indigo-500/30 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Request Booking
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
