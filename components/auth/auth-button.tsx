"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { forceLogout } from "@/lib/supabase/auth-utils"
import Link from "next/link"
import { User, LogOut } from "lucide-react"
import type { Session } from "@supabase/supabase-js"

export function AuthButton() {
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    let isMounted = true
    
    // Get initial session with better error handling
    const getInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (isMounted) {
          if (error) {
            console.error("Error getting session:", error)
            setSession(null)
          } else {
            setSession(data.session)
          }
          setLoading(false)
        }
      } catch (err) {
        console.error("Session check failed:", err)
        if (isMounted) {
          setSession(null)
          setLoading(false)
        }
      }
    }
    
    getInitialSession()
    
    // Fallback to stop loading after 10 seconds in case of network issues
    const loadingTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.warn("Auth session check timed out, stopping loading state")
        setLoading(false)
      }
    }, 10000)

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (isMounted) {
        console.log('Auth state change:', event, session ? 'session exists' : 'no session')
        setSession(session)
        setLoading(false) // Ensure loading is set to false on auth state changes
        if (event === 'SIGNED_OUT') {
          setSigningOut(false)
          setSession(null)
          // Don't redirect here, let handleSignOut handle it
        }
      }
    })

    return () => {
      isMounted = false
      clearTimeout(loadingTimeout)
      subscription?.unsubscribe()
    }
  }, [supabase.auth])

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      // Use the utility function for reliable logout
      await forceLogout()
    } catch (error) {
      console.error("Logout failed:", error)
      setSigningOut(false)
      // Force redirect as absolute fallback to homepage
      window.location.href = '/'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2" aria-label="Loading authentication status">
        <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
        <div className="w-16 h-4 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  if (session) {
    const display = session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email || "User"
    const shortDisplay = display.length > 15 ? display.substring(0, 15) + "..." : display
    
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-sm font-medium text-foreground">
              {shortDisplay}
            </span>
            <span className="text-xs text-muted-foreground">
              {session.user.email ? "Logged in" : "Connected"}
            </span>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={handleSignOut} disabled={signingOut} className="bg-transparent">
          <LogOut className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">{signingOut ? "Signing out..." : "Logout"}</span>
        </Button>
      </div>
    )
  }

  return (
    <Link href="/login">
      <Button size="sm">Login</Button>
    </Link>
  )
}
