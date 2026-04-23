import { useState, useEffect } from "react"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { getAllBookings, type BookingResponse } from "@/api/bookingsApi"
import { Building2, AlertTriangle, CalendarCheck, Activity } from "lucide-react"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"

interface Ticket {
  id: string
  category: string
  status: string
  priority: string
  createdAt: string
}

interface Facility {
  id: number
  type: string
  status: string
}

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#0ea5e9", "#f43f5e"]

export default function AdminAnalyticsPanel() {
  const [loading, setLoading] = useState(true)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [bookings, setBookings] = useState<BookingResponse[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketsRes, facilitiesRes, bookingsData] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/tickets`, { credentials: "include" }),
          fetch(`${API_BASE_URL}/api/v1/facilities`, { credentials: "include" }),
          getAllBookings()
        ])

        if (ticketsRes.ok) setTickets(await ticketsRes.json())
        if (facilitiesRes.ok) setFacilities(await facilitiesRes.json())
        setBookings(bookingsData)

      } catch (error) {
        console.error("Failed to fetch analytics data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Prepare Data for Charts
  const processData = () => {
    // Tickets by Status
    const ticketStatusCount = tickets.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const ticketStatusData = Object.entries(ticketStatusCount).map(([name, value], index) => ({ 
      name, 
      value, 
      fill: COLORS[index % COLORS.length] 
    }))

    // Tickets by Category
    const ticketCategoryCount = tickets.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const ticketCategoryData = Object.entries(ticketCategoryCount).map(([name, value], index) => ({ 
      name, 
      value, 
      fill: COLORS[(index + 1) % COLORS.length] 
    }))

    // Facilities by Type
    const facilityTypeCount = facilities.reduce((acc, f) => {
      acc[f.type] = (acc[f.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const facilityTypeData = Object.entries(facilityTypeCount).map(([name, value], index) => ({ 
      name: name.replace(/_/g, ' '), 
      value, 
      fill: COLORS[(index + 3) % COLORS.length] 
    }))

    // Bookings by Status
    const bookingStatusCount = bookings.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const bookingStatusData = Object.entries(bookingStatusCount).map(([name, value], index) => ({ 
      name, 
      value, 
      fill: COLORS[index % COLORS.length] 
    }))

    return { ticketStatusData, ticketCategoryData, facilityTypeData, bookingStatusData }
  }

  const { ticketStatusData, ticketCategoryData, facilityTypeData, bookingStatusData } = processData()

  // Custom Tooltip for dark mode
  const CustomTooltip = ({ active, payload, label }: { 
    active?: boolean; 
    payload?: Array<{ name: string; value: number; fill?: string; color?: string; payload?: { fill?: string } }>; 
    label?: string 
  }) => {
    if (active && payload && payload.length) {
      const color = payload[0].payload?.fill || payload[0].color || payload[0].fill || "#818cf8";
      return (
        <div className="bg-[#0a0a0a] border border-white/10 p-3 rounded-xl shadow-xl">
          <p className="text-white font-bold mb-1">{label || payload[0].name}</p>
          <p className="font-medium" style={{ color }}>Count: {payload[0].value}</p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px] animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center gap-4">
          <Activity className="h-10 w-10 text-indigo-500 animate-pulse" />
          <p className="text-white/50 font-black uppercase tracking-widest text-sm">Processing Telemetry...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-3">
        <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">System Analytics</h2>
        <p className="text-white/60 font-medium max-w-xl">Deep insights into campus operations. Real-time metrics on facilities usage, incident patterns, and booking volume.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Tickets Status Chart */}
        <div className="bg-[#0a0a0a]/50 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl flex flex-col items-center shadow-xl">
          <div className="flex items-center gap-3 w-full mb-6">
            <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Incident Status Distribution</h3>
          </div>
          <div className="w-full h-[300px]">
            {ticketStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ticketStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {ticketStatusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-white/30 font-bold uppercase text-xs">No Data Available</div>
            )}
          </div>
        </div>

        {/* Booking Status Chart */}
        <div className="bg-[#0a0a0a]/50 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl flex flex-col items-center shadow-xl">
          <div className="flex items-center gap-3 w-full mb-6">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CalendarCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Booking Requests Overview</h3>
          </div>
          <div className="w-full h-[300px]">
            {bookingStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingStatusData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {bookingStatusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-white/30 font-bold uppercase text-xs">No Data Available</div>
            )}
          </div>
        </div>

        {/* Facilities Types Chart */}
        <div className="bg-[#0a0a0a]/50 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl flex flex-col items-center shadow-xl">
          <div className="flex items-center gap-3 w-full mb-6">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Facilities by Category</h3>
          </div>
          <div className="w-full h-[300px]">
            {facilityTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={facilityTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    stroke="#0a0a0a"
                    strokeWidth={2}
                  >
                    {facilityTypeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-white/30 font-bold uppercase text-xs">No Data Available</div>
            )}
          </div>
        </div>

        {/* Tickets by Category Chart */}
        <div className="bg-[#0a0a0a]/50 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl flex flex-col items-center shadow-xl">
          <div className="flex items-center gap-3 w-full mb-6">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Activity className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Tickets by Classification</h3>
          </div>
          <div className="w-full h-[300px]">
            {ticketCategoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ticketCategoryData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                  <XAxis type="number" stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {ticketCategoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-white/30 font-bold uppercase text-xs">No Data Available</div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
