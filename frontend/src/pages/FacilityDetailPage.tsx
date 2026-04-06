import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import {
  ArrowLeft,
  Building2,
  MapPin,
  Users,
  Clock,
  CalendarDays,
  AlertCircle,
} from "lucide-react"

interface Facility {
  id: number
  name: string
  type: string
  capacity: number
  location: string
  availabilityWindows: string | null
  status: string
  createdAt: string
  updatedAt: string
}

const TYPE_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  LECTURE_HALL:  { bg: "bg-blue-500/15",    text: "text-blue-400",    icon: "text-blue-400" },
  LAB:          { bg: "bg-purple-500/15",   text: "text-purple-400",  icon: "text-purple-400" },
  MEETING_ROOM: { bg: "bg-amber-500/15",    text: "text-amber-400",   icon: "text-amber-400" },
  EQUIPMENT:    { bg: "bg-emerald-500/15",  text: "text-emerald-400", icon: "text-emerald-400" },
}

function typeLabel(type: string) {
  return type.replace(/_/g, " ")
}

export default function FacilityDetailPage() {
  const { user } = useAuth()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"

  const [facility, setFacility] = useState<Facility | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFacility = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const res = await fetch(`${API_BASE_URL}/api/v1/facilities/${id}`, {
          credentials: "include",
        })
        if (res.status === 404) {
          setError("Facility not found")
          return
        }
        if (!res.ok) throw new Error(`Failed to load facility (${res.status})`)
        const data = (await res.json()) as Facility
        setFacility(data)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong")
      } finally {
        setIsLoading(false)
      }
    }
    fetchFacility()
  }, [API_BASE_URL, id])

  if (!user) return null

  const typeStyle = facility ? (TYPE_STYLES[facility.type] ?? TYPE_STYLES.EQUIPMENT) : TYPE_STYLES.EQUIPMENT
  const isActive = facility?.status === "ACTIVE"

  return (
    <div className="min-h-svh bg-[#030303] text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden relative">
      {/* Background blurs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] h-[50%] w-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] h-[60%] w-[50%] rounded-full bg-purple-500/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] left-[20%] h-[40%] w-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-6 py-10">
        {/* Back button */}
        <button
          onClick={() => navigate("/facilities")}
          className="mb-8 flex items-center gap-2 text-sm text-white/50 transition hover:text-white/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Facilities
        </button>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-7 w-20 rounded-lg bg-white/10" />
              <div className="h-7 w-24 rounded-full bg-white/10" />
            </div>
            <div className="h-10 w-3/4 rounded-xl bg-white/10" />
            <div className="h-5 w-1/3 rounded-lg bg-white/5" />
            <div className="grid grid-cols-2 gap-4 pt-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
                  <div className="mb-2 h-4 w-16 rounded bg-white/10" />
                  <div className="h-6 w-24 rounded bg-white/5" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error / 404 state */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-16">
            <AlertCircle className="h-12 w-12 text-red-400" />
            <p className="text-lg font-semibold text-red-400">{error}</p>
            <button
              onClick={() => navigate("/facilities")}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm transition hover:bg-white/10"
            >
              Back to catalogue
            </button>
          </div>
        )}

        {/* Detail content */}
        {facility && !isLoading && !error && (
          <div className="space-y-8">
            {/* Type badge + status */}
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ${typeStyle.bg} ${typeStyle.text}`}
              >
                {typeLabel(facility.type)}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-red-500/15 text-red-400"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isActive ? "bg-emerald-400" : "bg-red-400"
                  }`}
                />
                {isActive ? "Active" : "Out of Service"}
              </span>
            </div>

            {/* Name */}
            <h1 className="text-4xl font-bold tracking-tight">{facility.name}</h1>

            {/* Location */}
            {facility.location && (
              <div className="flex items-center gap-2 text-white/50">
                <MapPin className="h-4 w-4" />
                <span>{facility.location}</span>
              </div>
            )}

            {/* Detail grid */}
            <div className="grid grid-cols-2 gap-4">
              <DetailCard
                icon={<Users className="h-5 w-5 text-blue-400" />}
                label="Capacity"
                value={`${facility.capacity} people`}
              />
              <DetailCard
                icon={<Building2 className={`h-5 w-5 ${typeStyle.icon}`} />}
                label="Type"
                value={typeLabel(facility.type)}
              />
              <DetailCard
                icon={<Clock className="h-5 w-5 text-amber-400" />}
                label="Availability"
                value={facility.availabilityWindows ?? "Not specified"}
              />
              <DetailCard
                icon={<CalendarDays className="h-5 w-5 text-white/40" />}
                label="Added"
                value={facility.createdAt}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DetailCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
        {icon}
        {label}
      </div>
      <p className="text-lg font-semibold text-white/80">{value}</p>
    </div>
  )
}
