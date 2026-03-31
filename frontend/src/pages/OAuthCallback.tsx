import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

/**
 * Landing page for the post-OAuth redirect.
 *
 * Flow:
 *   Google → Spring Boot (/login/oauth2/code/google)
 *     → OAuthSuccessHandler.onAuthenticationSuccess()
 *       → redirect to http://localhost:5173/oauth2/callback
 *         → this component calls refetch() to load the session
 *           → navigates to /dashboard
 */
export default function OAuthCallback() {
  const { refetch } = useAuth()
  const navigate = useNavigate()
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    refetch().then((user) => {
      if (user && user.roles.includes("ADMIN")) {
        navigate("/admin", { replace: true })
      } else {
        navigate("/dashboard", { replace: true })
      }
    })
  }, [refetch, navigate])

  return (
    <div className="flex min-h-svh items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white" />
        <p className="text-sm text-white/50">Completing sign-in…</p>
      </div>
    </div>
  )
}
