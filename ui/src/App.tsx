import { useState, useEffect } from "react";
import { LoginPage } from "./components/LoginPage";
import { Dashboard } from "./components/Dashboard";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/v1/resources", {
          credentials: "include",
        });
        // If we get a 200, user is authenticated
        // If we get 401/403, user is not authenticated
        setIsAuthenticated(response.ok);
      } catch (err) {
        console.error("Auth check error:", err);
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, []);

  if (isChecking) {
    return (
      <div className="relative min-h-screen bg-grid grain flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-ink-200 border-t-ink-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-ink-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? (
    <Dashboard onLogout={() => setIsAuthenticated(false)} />
  ) : (
    <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />
  );
}

export default App;
