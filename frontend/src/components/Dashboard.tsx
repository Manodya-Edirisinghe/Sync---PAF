import {
  Activity,
  Bell,
  CalendarClock,
  Radar,
  ShieldCheck,
  Wrench,
  LogOut,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { useOpsStore } from "../stores/opsStore";

interface DashboardProps {
  onLogout: () => void;
}

const signalStyles: Record<string, string> = {
  good: "bg-emerald-100 text-emerald-700 border-emerald-200",
  warn: "bg-amber-100 text-amber-700 border-amber-200",
  urgent: "bg-rose-100 text-rose-700 border-rose-200",
};

export function Dashboard({ onLogout }: DashboardProps) {
  const { campus, kpis, modules } = useOpsStore();

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8080/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      onLogout();
    }
  };

  return (
    <div className="relative min-h-screen bg-grid grain">
      <div className="absolute inset-x-0 top-0 h-[520px] bg-gradient-to-b from-white/90 via-white/60 to-transparent" />
      <header className="relative z-10 px-6 pt-8">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-full border border-ink-900/10 bg-white/80 px-6 py-3 shadow-card backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink-900 text-white">
              <Radar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-ink-500">Smart Campus</p>
              <p className="font-semibold text-ink-900">Operations Hub</p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-ink-700 md:flex">
            <span className="text-ink-900">Overview</span>
            <span>Facilities</span>
            <span>Bookings</span>
            <span>Incidents</span>
            <span>Security</span>
          </nav>
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-24 pt-12">
        {/* Campus Overview */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-ink-900">{campus.name}</h1>
            <p className="text-ink-600">{campus.statusMessage}</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {Object.entries(kpis).map(([key, value]) => (
              <Card key={key} className="overflow-hidden border-ink-200">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-ink-900">{value.current}</div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-ink-500 font-medium">{value.name}</span>
                    <Badge
                      className={`text-xs ${signalStyles[value.status]}`}
                      variant="outline"
                    >
                      {value.status === "good"
                        ? "↑"
                        : value.status === "warn"
                          ? "→"
                          : "↓"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Active Zones */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-ink-900">Active Zones</h2>
            <span className="inline-block animate-pulse">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {modules.facilities &&
              Object.entries(modules.facilities).map(([zone, data]) => (
                <Card key={zone} className="border-ink-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-ink-900">{zone}</h3>
                      <Badge
                        className={`text-xs ${signalStyles[data.signal]}`}
                        variant="outline"
                      >
                        {data.signal}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-600">Capacity</span>
                      <span className="font-semibold text-ink-900">{data.capacity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-600">Occupancy</span>
                      <span className="font-semibold text-ink-900">{data.occupancy}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-600">Uptime</span>
                      <span className="font-semibold text-ink-900">{data.uptime}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </section>

        {/* System Health */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-ink-900">System Health Overview</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-ink-200 bg-gradient-to-br from-emerald-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="font-semibold text-ink-900">Facilities</h3>
                <Activity className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">95%</div>
                <p className="text-xs text-ink-600">All systems nominal</p>
              </CardContent>
            </Card>

            <Card className="border-ink-200 bg-gradient-to-br from-amber-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="font-semibold text-ink-900">Security</h3>
                <ShieldCheck className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-ink-600">Alerts requiring attention</p>
              </CardContent>
            </Card>

            <Card className="border-ink-200 bg-gradient-to-br from-rose-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="font-semibold text-ink-900">Maintenance</h3>
                <Wrench className="h-4 w-4 text-rose-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-ink-600">Scheduled tasks today</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-ink-900" />
            <h2 className="text-xl font-bold text-ink-900">Recent Activity</h2>
          </div>
          <Card className="border-ink-200">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex gap-3 py-2 border-b border-ink-100 last:border-0">
                  <CalendarClock className="h-5 w-5 text-ink-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-ink-900 text-sm">Room B205 scheduled maintenance</p>
                    <p className="text-xs text-ink-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex gap-3 py-2 border-b border-ink-100 last:border-0">
                  <ShieldCheck className="h-5 w-5 text-ink-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-ink-900 text-sm">Security audit completed</p>
                    <p className="text-xs text-ink-500">4 hours ago</p>
                  </div>
                </div>
                <div className="flex gap-3 py-2 border-b border-ink-100 last:border-0">
                  <Activity className="h-5 w-5 text-ink-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-ink-900 text-sm">Peak occupancy reached in District A</p>
                    <p className="text-xs text-ink-500">6 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
