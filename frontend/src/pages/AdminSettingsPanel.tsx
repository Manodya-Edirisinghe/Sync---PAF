import { useState, useEffect } from "react"
import { Bell, BellOff, Clock, ShieldCheck, Settings2, Save } from "lucide-react"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"

interface GlobalSettings {
  id: number
  notificationsEnabled: boolean
  bookingSnoozeUntil: string | null
  facilitySnoozeUntil: string | null
  auditSnoozeUntil: string | null
  ticketSnoozeUntil: string | null
}

const SNOOZE_OPTIONS = [
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "1 hr", value: 60 },
  { label: "2 hrs", value: 120 },
  { label: "8 hrs", value: 480 },
  { label: "24 hrs", value: 1440 },
]

export default function AdminSettingsPanel() {
  const [settings, setSettings] = useState<GlobalSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/settings`, { credentials: "include" })
      if (res.ok) {
        setSettings(await res.json())
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
        credentials: "include"
      })
      if (res.ok) {
        setSettings(await res.json())
      }
    } catch (err) {
      console.error("Failed to save settings:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleSnooze = (field: keyof GlobalSettings, minutes: number) => {
    if (!settings) return
    const snoozeDate = new Date()
    snoozeDate.setMinutes(snoozeDate.getMinutes() + minutes)
    setSettings({ ...settings, [field]: snoozeDate.toISOString() })
  }

  const clearSnooze = (field: keyof GlobalSettings) => {
    if (!settings) return
    setSettings({ ...settings, [field]: null })
  }

  const isSnoozed = (isoDate: string | null) => {
    if (!isoDate) return false
    return new Date(isoDate) > new Date()
  }

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center h-[500px] animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center gap-4">
          <Settings2 className="h-10 w-10 text-indigo-500 animate-spin-slow" />
          <p className="text-white/50 font-black uppercase tracking-widest text-sm">Loading Configuration...</p>
        </div>
      </div>
    )
  }

  const categories = [
    { key: "bookingSnoozeUntil", label: "Booking Notifications" },
    { key: "facilitySnoozeUntil", label: "Facility Notifications" },
    { key: "auditSnoozeUntil", label: "Audit Alerts" },
    { key: "ticketSnoozeUntil", label: "Ticket Notifications" },
  ] as const

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Global Settings</h2>
          <p className="text-white/60 font-medium max-w-xl">Manage system-wide configuration, notification preferences, and temporary silences across all operational modules.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-black uppercase tracking-widest text-[10px] px-8 py-4 rounded-2xl transition-all active:scale-95 shadow-xl shadow-indigo-500/20 shrink-0"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Configuration"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Master Notification Toggle */}
        <div className="lg:col-span-4 bg-[#0a0a0a]/50 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-xl h-fit">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
            <ShieldCheck className="h-6 w-6 text-indigo-400" />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Master Override</h3>
          <p className="text-sm font-medium text-white/50 mb-8">Globally enable or disable all system notifications. This overrides individual module settings.</p>
          
          <button 
            onClick={() => setSettings({ ...settings, notificationsEnabled: !settings.notificationsEnabled })}
            className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 ${
              settings.notificationsEnabled 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            <div className="flex items-center gap-4">
              {settings.notificationsEnabled ? <Bell className="h-6 w-6" /> : <BellOff className="h-6 w-6" />}
              <span className="font-black uppercase tracking-widest text-xs">
                {settings.notificationsEnabled ? "Notifications Active" : "Notifications Disabled"}
              </span>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.notificationsEnabled ? 'bg-emerald-500/30' : 'bg-red-500/30'}`}>
              <div className={`w-4 h-4 rounded-full transition-transform ${settings.notificationsEnabled ? 'translate-x-6 bg-emerald-400' : 'translate-x-0 bg-red-400'}`} />
            </div>
          </button>
        </div>

        {/* Module Snooze Settings */}
        <div className="lg:col-span-8 bg-[#0a0a0a]/50 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Clock className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Temporary Silencing</h3>
              <p className="text-xs font-medium text-white/40">Mute specific notification categories for a set duration.</p>
            </div>
          </div>

          <div className="space-y-6">
            {categories.map(({ key, label }) => {
              const currentValue = settings[key]
              const snoozed = isSnoozed(currentValue)
              
              return (
                <div key={key} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">{label}</h4>
                    {snoozed ? (
                      <p className="text-xs font-bold text-orange-400 flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        Snoozed until {new Date(currentValue as string).toLocaleTimeString()}
                      </p>
                    ) : (
                      <p className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                        <Bell className="h-3 w-3" />
                        Currently Active
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {SNOOZE_OPTIONS.map(opt => (
                      <button
                        key={opt.label}
                        onClick={() => handleSnooze(key, opt.value)}
                        className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                      >
                        {opt.label}
                      </button>
                    ))}
                    {snoozed && (
                      <button
                        onClick={() => clearSnooze(key)}
                        className="ml-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
