import { createSupabaseBrowserClient } from './client'

// Test function to check session status
export async function testSessionStatus() {
  const supabase = createSupabaseBrowserClient()
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    console.log('Current session status:', {
      hasSession: !!session,
      userId: session?.user?.id,
      email: session?.user?.email,
      error: error?.message
    })
    return { session, error }
  } catch (err) {
    console.error('Session check failed:', err)
    return { session: null, error: err }
  }
}

// Function to test logout functionality
export async function testLogout() {
  console.log('=== Testing Logout Functionality ===')
  
  // Check session before logout
  console.log('Before logout:')
  await testSessionStatus()
  
  const supabase = createSupabaseBrowserClient()
  
  // Perform logout
  console.log('Performing logout...')
  const { error } = await supabase.auth.signOut({ scope: 'global' })
  
  if (error) {
    console.error('Logout error:', error)
  } else {
    console.log('Logout successful')
  }
  
  // Check session after logout
  setTimeout(async () => {
    console.log('After logout:')
    await testSessionStatus()
  }, 1000)
}

// Add to window for debugging in browser console
if (typeof window !== 'undefined') {
  (window as any).testSessionStatus = testSessionStatus;
  (window as any).testLogout = testLogout;
}