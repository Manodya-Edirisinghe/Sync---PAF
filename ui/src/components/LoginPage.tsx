import { useState } from "react";
import { Radar, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (response.ok || response.status === 302) {
        // Login successful - server responded with redirect
        setUsername("");
        setPassword("");
        onLoginSuccess();
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("Failed to connect to server. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-grid grain">
      <div className="absolute inset-x-0 top-0 h-[520px] bg-gradient-to-b from-white/90 via-white/60 to-transparent" />

      <div className="relative z-10 flex items-center justify-center min-h-screen px-6 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-900 text-white">
                <Radar className="h-6 w-6" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-ink-900">Smart Campus</h1>
            <p className="text-sm text-ink-500 mt-1">Operations Hub</p>
          </CardHeader>

          <CardContent>
            <div className="text-center mb-6">
              <p className="text-sm text-ink-600">
                Enter your credentials to access the operations dashboard
              </p>
            </div>

            {error && (
              <div className="mb-4 flex gap-3 rounded-lg bg-rose-50 border border-rose-200 p-3">
                <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
                <p className="text-sm text-rose-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-900 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  disabled={loading}
                  className="w-full px-3 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink-900 focus:border-transparent disabled:opacity-50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-900 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full px-3 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink-900 focus:border-transparent disabled:opacity-50"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !username || !password}
                className="w-full bg-ink-900 hover:bg-ink-800 text-white"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-ink-200">
              <p className="text-xs text-ink-500 text-center mb-3">Demo Credentials:</p>
              <div className="space-y-2 text-xs">
                <div className="bg-slate-50 p-2 rounded text-ink-700">
                  <strong>Admin:</strong> admin / admin123
                </div>
                <div className="bg-slate-50 p-2 rounded text-ink-700">
                  <strong>User:</strong> user / user123
                </div>
                <div className="bg-slate-50 p-2 rounded text-ink-700">
                  <strong>Technician:</strong> technician / tech123
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
