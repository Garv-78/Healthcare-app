import { createSupabaseBrowserClient } from './client'

export async function clearUserSession() {
  const supabase = createSupabaseBrowserClient()
  
  try {
    // Sign out with global scope to clear all sessions
    const { error } = await supabase.auth.signOut({ scope: 'global' })
    
    if (error) {
      console.error('Supabase signOut error:', error)
      throw new Error(`Supabase sign out failed: ${error.message}`)
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
    
    return { success: true }
  } catch (error) {
    console.error('Session clear error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function forceLogout(showToast: boolean = true): Promise<{ success: boolean; error?: string }> {
  try {
    // Call server-side logout API first
    const apiResponse = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!apiResponse.ok) {
      console.warn('Server logout API failed with status:', apiResponse.status)
    }
  } catch (apiError) {
    console.warn('Server logout API failed:', apiError)
    // Continue with client-side logout even if server-side fails
  }
  
  // Clear client-side session
  const sessionResult = await clearUserSession()
  
  if (!sessionResult.success) {
    console.error('Failed to clear user session:', sessionResult.error)
    return { success: false, error: sessionResult.error }
  }

  // Add a small delay to ensure all cleanup is complete
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Force redirect to homepage
  window.location.href = '/'
  
  return { success: true }
}