import {
  Activity,
  Bell,
  CalendarClock,
  Radar,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader } from "./components/ui/card";
import { useOpsStore } from "./stores/opsStore";

const signalStyles: Record<string, string> = {
  good: "bg-emerald-100 text-emerald-700 border-emerald-200",
  warn: "bg-amber-100 text-amber-700 border-amber-200",
  urgent: "bg-rose-100 text-rose-700 border-rose-200",
};

function App() {
  const { campus, kpis, modules } = useOpsStore();

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
          <Button size="sm" variant="outline">
            Live Demo
          </Button>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-24 pt-12">
        <section className="grid gap-10 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Badge className="border-ink-900/20 bg-white/70 text-ink-700">
              Campus Command Center
            </Badge>
            <h1 className="font-display text-4xl leading-tight text-ink-900 md:text-5xl">
              See every facility, booking, and incident in one live campus view.
            </h1>
            <p className="max-w-xl text-lg text-ink-500">
              A premium operations console for modern universities. Coordinate assets,
              approve spaces, and guide technicians with a single, secured interface.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg">Launch Ops Console</Button>
              <Button size="lg" variant="outline">
                View Implementation Plan
              </Button>
            </div>
            <div className="flex items-center gap-6 text-sm text-ink-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-ink-900" />
                OAuth2 secured
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-ink-900" />
                Real-time insights
              </div>
            </div>
          </div>
          <Card className="relative overflow-hidden">
            <CardHeader className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-ink-900">Operations Pulse</p>
                <p className="text-xs text-ink-500">{campus}</p>
              </div>
              <Badge className="border-ink-900/10 bg-dawn-50 text-ink-700">
                03:42 PM
              </Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                {kpis.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-ink-900/10 bg-white/80 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-ink-500">
                      {item.label}
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-ink-900">
                      {item.value}
                    </p>
                    <p className="mt-1 text-xs text-ink-500">{item.note}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-ink-900/10 bg-ink-900 px-4 py-3 text-sm text-white">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Campus alert center
                </div>
                <span className="text-xs uppercase tracking-[0.3em]">2 new</span>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <h2 className="font-display text-2xl text-ink-900">
              Module readiness matrix
            </h2>
            <div className="grid gap-4">
              {modules.map((module) => (
                <Card key={module.title} className="border-ink-900/10">
                  <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-ink-900">
                        {module.title}
                      </p>
                      <p className="text-sm text-ink-500">{module.summary}</p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                        signalStyles[module.signal]
                      }`}
                    >
                      {module.status}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="font-display text-2xl text-ink-900">Workflow highlights</h2>
            <div className="grid gap-4">
              <Card className="border-ink-900/10">
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-ink-900">Booking queue</p>
                    <CalendarClock className="h-5 w-5 text-ink-700" />
                  </div>
                  <p className="text-sm text-ink-500">
                    6 approvals awaiting review with two potential conflicts.
                  </p>
                  <Button variant="outline" size="sm">
                    Review bookings
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-ink-900/10">
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-ink-900">Incident triage</p>
                    <Wrench className="h-5 w-5 text-ink-700" />
                  </div>
                  <p className="text-sm text-ink-500">
                    Two critical tickets need technician assignment within 30 minutes.
                  </p>
                  <Button variant="outline" size="sm">
                    Assign techs
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
