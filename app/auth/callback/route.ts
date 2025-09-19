import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const role = requestUrl.searchParams.get('role') || 'patient'

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.delete({ name, ...options })
          },
        },
      }
    )
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Create/update profile for OAuth user
      try {
        const user = data.user
        const profileData = {
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          phone: user.user_metadata?.phone_number || '',
          role: role as 'patient' | 'doctor',
          language: 'en'
        }
        
        // Call our profile API to create/update the profile
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin
        await fetch(`${baseUrl}/api/profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.session?.access_token}`
          },
          body: JSON.stringify(profileData)
        })
        
        // Redirect to home page - let the app handle role-based routing from there
        return NextResponse.redirect(`${requestUrl.origin}/`)
        
      } catch (profileError) {
        console.error('Profile creation error:', profileError)
        // Still redirect to home page
        return NextResponse.redirect(`${requestUrl.origin}/`)
      }
    }
  }

  // Something went wrong, redirect back to login
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}