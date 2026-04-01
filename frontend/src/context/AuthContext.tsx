import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { AuthUser } from "@/types"

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  logout: () => Promise<void>
  refetch: () => Promise<AuthUser | null>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  logout: async () => {},
  refetch: async () => null,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = async (): Promise<AuthUser | null> => {
    try {
      const res = await fetch(`${API_BASE}/api/me`, {
        credentials: "include",
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data)
        return data
      } else {
        setUser(null)
        return null
      }
    } catch {
      setUser(null)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: "POST",
        credentials: "include",
      })
    } catch {
      // ignore
    } finally {
      setUser(null)
      window.location.href = "/"
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, logout, refetch: fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
