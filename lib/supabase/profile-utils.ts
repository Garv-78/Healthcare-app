import { createSupabaseBrowserClient } from './client'

export async function checkUserProfileStatus(userId: string) {
  const supabase = createSupabaseBrowserClient()
  
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (error && error.code === 'PGRST116') {
      // No profile found - new user
      return { hasProfile: false, isComplete: false, profile: null }
    }
    
    if (error) {
      console.error('Error checking profile:', error)
      return { hasProfile: false, isComplete: false, profile: null }
    }
    
    if (!profile) {
      return { hasProfile: false, isComplete: false, profile: null }
    }
    
    // Check if profile has essential information
    const hasEssentialInfo = !!(profile.name && profile.role)
    
    return { 
      hasProfile: true, 
      isComplete: hasEssentialInfo, 
      profile 
    }
  } catch (error) {
    console.error('Profile status check failed:', error)
    return { hasProfile: false, isComplete: false, profile: null }
  }
}

export async function getPostLoginRedirect(userId: string): Promise<string> {
  const status = await checkUserProfileStatus(userId)
  
  if (!status.hasProfile || !status.isComplete) {
    // New user or incomplete profile - go to profile page
    return '/profile'
  }
  
  // Existing user with complete profile - go to homepage
  return '/'
}