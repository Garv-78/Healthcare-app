"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import Link from "next/link"

export function AuthButton() {
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)
  const [session, setSession] = useState<any>(null)
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    let isMounted = true
    
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session)
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (isMounted) {
        setSession(session)
        if (event === 'SIGNED_OUT') {
          setSigningOut(false)
          // Redirect to home after sign out
          window.location.href = '/'
        }
      }
    })

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [supabase.auth])

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      // Clear session state immediately for better UX
      setSession(null)
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Sign out error:", error)
        // Restore session if sign out failed
        const { data } = await supabase.auth.getSession()
        setSession(data.session)
        setSigningOut(false)
        return
      }
      
      // Clear any localStorage items
      localStorage.removeItem('hc_pending_profile')
      
      // The SIGNED_OUT event will handle redirect
    } catch (error) {
      console.error("Sign out error:", error)
      setSigningOut(false)
    }
  }

  if (loading) return null

  if (session) {
    const display = session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email || session.user.phone || "Account"
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground hidden md:inline">{display}</span>
        <Button size="sm" variant="outline" onClick={handleSignOut} disabled={signingOut} className="bg-transparent">
          {signingOut ? "Signing out..." : "Logout"}
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
