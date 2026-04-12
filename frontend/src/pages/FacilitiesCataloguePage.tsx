import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import {
  Building2,
  MapPin,
  Users,
  ArrowLeft,
  Search,
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

const TYPE_STYLES: Record<string, { bg: string; text: string }> = {
  LECTURE_HALL: { bg: "bg-blue-500/15", text: "text-blue-400" },
  LAB:         { bg: "bg-purple-500/15", text: "text-purple-400" },
  MEETING_ROOM:{ bg: "bg-amber-500/15", text: "text-amber-400" },
  EQUIPMENT:   { bg: "bg-emerald-500/15", text: "text-emerald-400" },
}

function typeLabel(type: string) {
  return type.replace(/_/g, " ")
}

export default function FacilitiesCataloguePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"

  const [facilities, setFacilities] = useState<Facility[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [selectedType, setSelectedType] = useState("ALL")

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const res = await fetch(`${API_BASE_URL}/api/v1/facilities`, {
          credentials: "include",
        })
        if (!res.ok) throw new Error(`Failed to load facilities (${res.status})`)
        const data = (await res.json()) as Facility[]
        setFacilities(data)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong")
      } finally {
        setIsLoading(false)
      }
    }
    fetchFacilities()
  }, [API_BASE_URL])

  if (!user) return null

  const availableTypes = Array.from(new Set(facilities.map((f) => f.type))).sort()

  const filtered = facilities.filter((f) => {
    const q = search.toLowerCase()
    const matchesType = selectedType === "ALL" || f.type === selectedType
    if (!matchesType) return false
    return (
      f.name.toLowerCase().includes(q) ||
      f.type.toLowerCase().includes(q) ||
      (f.location && f.location.toLowerCase().includes(q))
    )
  })

  return (
    <div className="min-h-svh bg-[#030303] text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden relative">
      {/* Background blurs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] h-[50%] w-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] h-[60%] w-[50%] rounded-full bg-purple-500/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] left-[20%] h-[40%] w-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Facilities</h1>
              <p className="text-sm text-white/50">Browse campus facilities and resources</p>
            </div>
          </div>
        </div>

        {/* Search and type filter */}
        <div className="mb-8 grid gap-3 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search by name, type, or location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-white/20 focus:bg-white/[0.07]"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/[0.07]"
          >
            <option value="ALL" className="bg-[#111111]">All types</option>
            {availableTypes.map((type) => (
              <option key={type} value={type} className="bg-[#111111]">
                {typeLabel(type)}
              </option>
            ))}
          </select>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-white/5 bg-white/[0.03] p-6"
              >
                <div className="mb-4 h-5 w-24 rounded-lg bg-white/10" />
                <div className="mb-2 h-6 w-3/4 rounded-lg bg-white/10" />
                <div className="mb-4 h-4 w-1/2 rounded-lg bg-white/5" />
                <div className="flex gap-3">
                  <div className="h-4 w-16 rounded-lg bg-white/5" />
                  <div className="h-4 w-20 rounded-lg bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-12">
            <AlertCircle className="h-10 w-10 text-red-400" />
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-16">
            <Building2 className="h-12 w-12 text-white/20" />
            <p className="text-white/40">
              {search ? "No facilities match your search" : "No facilities available"}
            </p>
          </div>
        )}

        {/* Card grid */}
        {!isLoading && !error && filtered.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((facility) => {
              const typeStyle = TYPE_STYLES[facility.type] ?? TYPE_STYLES.EQUIPMENT
              const isActive = facility.status === "ACTIVE"

              return (
                <button
                  key={facility.id}
                  onClick={() => navigate(`/facilities/${facility.id}`)}
                  className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 text-left transition-all hover:border-white/15 hover:bg-white/[0.05]"
                >
                  {/* Type badge + status chip */}
                  <div className="mb-4 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${typeStyle.bg} ${typeStyle.text}`}
                    >
                      {typeLabel(facility.type)}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
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
                  <h3 className="mb-1 text-lg font-semibold tracking-tight text-white/90 group-hover:text-white">
                    {facility.name}
                  </h3>

                  {/* Location */}
                  {facility.location && (
                    <div className="mb-4 flex items-center gap-1.5 text-sm text-white/40">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{facility.location}</span>
                    </div>
                  )}

                  {/* Capacity + availability */}
                  <div className="flex items-center gap-4 text-xs text-white/30">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      <span>Capacity {facility.capacity}</span>
                    </div>
                    {facility.availabilityWindows && (
                      <span className="truncate">{facility.availabilityWindows}</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
