import { createSupabaseBrowserClient } from './client'
import type { User } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  name?: string  // Changed from full_name to name
  avatar_url?: string
  role?: string
  created_at?: string
  updated_at?: string
}

/**
 * Get the current user's profile information including avatar
 */
export async function getUserProfile(user: User): Promise<UserProfile | null> {
  const supabase = createSupabaseBrowserClient()
  
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, name, avatar_url, role, created_at, updated_at')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    console.log('getUserProfile result:', profile)
    return profile
  } catch (error) {
    console.error('Failed to fetch user profile:', error)
    return null
  }
}

/**
 * Get the display name for a user
 * Prioritizes: profile.name → user_metadata.full_name → user_metadata.name → email
 */
export function getUserDisplayName(user: User, profile?: UserProfile | null): string {
  if (profile?.name) return profile.name
  if (user.user_metadata?.full_name) return user.user_metadata.full_name
  if (user.user_metadata?.name) return user.user_metadata.name
  return user.email || 'User'
}

/**
 * Get the user's profile image URL with fallback to placeholder
 */
export function getUserAvatarUrl(profile?: UserProfile | null): string {
  return profile?.avatar_url || '/placeholder-user.jpg'
}

/**
 * Get initials for avatar fallback
 */
export function getUserInitials(displayName: string): string {
  return displayName
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}