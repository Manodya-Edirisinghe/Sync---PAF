import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/context/AuthContext"
import { LoginPage } from "@/components/LoginPage"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import Dashboard from "@/pages/Dashboard"
import AdminDashboard from "@/pages/AdminDashboard"
import FacilitiesCataloguePage from "@/pages/FacilitiesCataloguePage"
import FacilityDetailPage from "@/pages/FacilityDetailPage"
import OAuthCallback from "@/pages/OAuthCallback"
import MyBookingsPage from "@/pages/bookings/MyBookingsPage"
import NewBookingPage from "@/pages/bookings/NewBookingPage"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LoginPage />} />

          {/* OAuth callback — Spring Boot redirects here after Google sign-in */}
          <Route path="/oauth2/callback" element={<OAuthCallback />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Facilities catalogue */}
          <Route
            path="/facilities"
            element={
              <ProtectedRoute>
                <FacilitiesCataloguePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/facilities/:id"
            element={
              <ProtectedRoute>
                <FacilityDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/bookings/my"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/new"
            element={
              <ProtectedRoute>
                <NewBookingPage />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
