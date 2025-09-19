"use client"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Mail, Lock, User, Phone, UserCircle2 } from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

type Role = "patient" | "doctor"

export default function AuthPage() {
  const supabase = createSupabaseBrowserClient()
  const router = useRouter()
  const [mode, setMode] = useState<"login" | "register">("register")
  const [role, setRole] = useState<Role>("patient")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  // Check if user is already logged in and redirect
  useEffect(() => {
    let isMounted = true
    
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (isMounted) {
          if (error) {
            console.log('Session check error:', error)
            // If there's an error, assume no session and show login
            setChecking(false)
            return
          }
          
          if (session?.user) {
            console.log('Found existing session, redirecting...')
            // User is already logged in, redirect to home
            router.replace('/')
            return
          }
          
          console.log('No session found, showing login form')
          // No session, safe to show login page
          setChecking(false)
        }
      } catch (error) {
        console.error('Session check error:', error)
        if (isMounted) {
          setChecking(false)
        }
      }
    }
    
    checkSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, !!session)
      if (isMounted && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        // Wait a moment for profile to be created/updated
        setTimeout(() => {
          if (isMounted) {
            router.replace('/')
          }
        }, 1000)
      }
      
      // If user signs out while on this page, stop checking
      if (event === 'SIGNED_OUT') {
        setChecking(false)
      }
    })

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [supabase.auth, router])

  // Preselect role from query (?role=doctor)
  useEffect(() => {
    const url = new URL(window.location.href)
    const r = url.searchParams.get("role") as Role | null
    if (r === "doctor" || r === "patient") setRole(r)
    const m = url.searchParams.get("mode") as "login" | "register" | null
    if (m) setMode(m)
    
    // Check if user explicitly wants to access login (force parameter)
    const force = url.searchParams.get("force")
    if (force === "true") {
      console.log('Force access to login page requested')
      setChecking(false)
    }
  }, [])

  // ALWAYS call useMemo before any conditional returns - React Rules of Hooks
  const canSubmit = useMemo(() => {
    if (mode === "register") return !!(name && phone && email && password)
    return !!(email && password)
  }, [mode, name, phone, email, password])

  // Show loading while checking session (unless forced)
  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  const handleRegister = async () => {
    try {
      setLoading(true)
      setStatus(null)
      const { data, error: signUpErr } = await supabase.auth.signUp({ email, password })
      if (signUpErr) throw signUpErr
      
      const session = data.session
      const payload = { name, language: "en", role, phone }
      
      if (session) {
        // session present -> upsert profile now
        await fetch("/api/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        setStatus("Registered and signed in! Redirecting...")
        // Don't manually redirect, let the auth state listener handle it
      } else {
        // likely email confirmation required; save pending profile to apply post-verification
        localStorage.setItem("hc_pending_profile", JSON.stringify(payload))
        setStatus("Registered. Please check your email to verify your account.")
        setLoading(false)
      }
    } catch (e: any) {
      setStatus(e?.message || "Registration failed")
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    try {
      setLoading(true)
      setStatus(null)
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      
      setStatus("Logged in successfully! Redirecting...")
      
      // Apply any pending profile data (if user just verified)
      const pending = localStorage.getItem("hc_pending_profile")
      if (pending) {
        try {
          await fetch("/api/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: pending })
          localStorage.removeItem("hc_pending_profile")
        } catch {}
      }
      
      // Don't manually redirect, let the auth state listener handle it
    } catch (e: any) {
      setStatus(e?.message || "Login failed")
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    try {
      setLoading(true)
      setStatus(null)
      
      // Store selected role for after OAuth callback
      localStorage.setItem("hc_selected_role", role)
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?role=${role}`
        }
      })
      
      if (error) throw error
    } catch (e: any) {
      setStatus(e?.message || "Google sign in failed")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Button>
              </Link>
              <h1 className="text-xl font-bold">{mode === "register" ? "Register" : "Login"}</h1>
            </div>
            <div className="text-xs text-muted-foreground">
              <span>Already logged in? </span>
              <Link href="/" className="underline hover:no-underline">Go to homepage</Link>
              <span> or </span>
              <button 
                onClick={async () => {
                  await supabase.auth.signOut()
                  setChecking(false)
                }}
                className="underline hover:no-underline"
              >
                Sign out first
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Welcome to HealthConnect</CardTitle>
                <div className="flex gap-1 rounded-lg border p-1 text-xs">
                  <button
                    className={`rounded-md px-3 py-1 ${mode === "register" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                    onClick={() => setMode("register")}
                  >
                    Register
                  </button>
                  <button
                    className={`rounded-md px-3 py-1 ${mode === "login" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                    onClick={() => setMode("login")}
                  >
                    Login
                  </button>
                </div>
              </div>
              <CardDescription>{mode === "register" ? "Create your account" : "Enter your credentials"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Role selector */}
              <div className="flex gap-2">
                <button
                  className={`flex-1 rounded-md border px-3 py-2 text-sm ${role === "patient" ? "border-primary bg-primary/10" : ""}`}
                  onClick={() => setRole("patient")}
                >
                  <UserCircle2 className="mr-2 inline h-4 w-4" /> Patient
                </button>
                <button
                  className={`flex-1 rounded-md border px-3 py-2 text-sm ${role === "doctor" ? "border-secondary bg-secondary/10" : ""}`}
                  onClick={() => setRole("doctor")}
                >
                  <User className="mr-2 inline h-4 w-4" /> Doctor
                </button>
              </div>

              {mode === "register" && (
                <div className="space-y-3">
                  <label className="block text-sm">Full name</label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                  </div>
                  <label className="mt-2 block text-sm">Phone</label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g., +919876543210" />
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-sm">Email</label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <label className="mt-2 block text-sm">Password</label>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                </div>
              </div>

              {status && <p className="text-sm text-muted-foreground">{status}</p>}

              <div className="pt-2 space-y-3">
                {mode === "register" ? (
                  <Button className="w-full" disabled={!canSubmit || loading} onClick={handleRegister}>
                    Create account
                  </Button>
                ) : (
                  <Button className="w-full" disabled={!canSubmit || loading} onClick={handleLogin}>
                    Login
                  </Button>
                )}
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  disabled={loading} 
                  onClick={handleGoogleAuth}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
