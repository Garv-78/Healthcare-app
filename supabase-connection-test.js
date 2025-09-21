// Quick Supabase connection test
// Run this in your browser console at http://localhost:3000 to test connectivity

const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Testing Supabase Connection...')
    
    // Test 1: Check if supabase client is available
    if (typeof window !== 'undefined' && window.supabase) {
      console.log('✅ Supabase client found')
    } else {
      console.log('⚠️ Supabase client not found in window')
    }
    
    // Test 2: Try to get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError)
      return false
    }
    
    if (session) {
      console.log('✅ User is authenticated:', session.user.email)
      
      // Test 3: Try to query profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('❌ Profile query error:', profileError)
        return false
      }
      
      if (profile) {
        console.log('✅ Profile found:', profile)
        console.log('📊 Available fields:', Object.keys(profile))
      } else {
        console.log('ℹ️ No profile found (new user)')
      }
      
      // Test 4: Check storage access
      const { data: buckets, error: storageError } = await supabase.storage.listBuckets()
      
      if (storageError) {
        console.warn('⚠️ Storage access limited:', storageError.message)
      } else {
        console.log('✅ Storage accessible, buckets:', buckets.map(b => b.name))
      }
      
    } else {
      console.log('ℹ️ No authenticated user')
    }
    
    console.log('✅ Supabase connection test completed')
    return true
    
  } catch (error) {
    console.error('❌ Connection test failed:', error)
    return false
  }
}

// Instructions
console.log('🚀 Supabase Connection Tester Ready!')
console.log('📝 To test your connection:')
console.log('1. Open your app at http://localhost:3000')
console.log('2. Open browser developer tools (F12)')
console.log('3. Go to Console tab')
console.log('4. Run: testSupabaseConnection()')