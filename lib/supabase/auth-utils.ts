import { createSupabaseBrowserClient } from './client'

export async function clearUserSession() {
  const supabase = createSupabaseBrowserClient()
  
  try {
    // Sign out with global scope to clear all sessions
    const { error } = await supabase.auth.signOut({ scope: 'global' })
    
    if (error) {
      console.error('Supabase signOut error:', error)
    }
    
    // Clear all local storage items related to Supabase
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase') || key === 'hc_pending_profile') {
          localStorage.removeItem(key)
        }
      })
    } catch (storageError) {
      console.warn('Could not clear localStorage:', storageError)
    }
    
    // Clear session storage
    try {
      sessionStorage.clear()
    } catch (storageError) {
      console.warn('Could not clear sessionStorage:', storageError)
    }
    
    return true
  } catch (error) {
    console.error('Session clear error:', error)
    return false
  }
}

export async function forceLogout() {
  try {
    // Call server-side logout API
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (apiError) {
    console.warn('Server logout API failed:', apiError)
  }
  
  // Clear client-side session
  await clearUserSession()
  
  // Force redirect to homepage instead of login
  window.location.href = '/'
}