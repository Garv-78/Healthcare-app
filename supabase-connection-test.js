


const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Testing Supabase Connection...')

    if (typeof window !== 'undefined' && window.supabase) {
      console.log('✅ Supabase client found')
    } else {
      console.log('⚠️ Supabase client not found in window')
    }

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError)
      return false
    }
    
    if (session) {
      console.log('✅ User is authenticated:', session.user.email)

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

console.log('🚀 Supabase Connection Tester Ready!')
console.log('📝 To test your connection:')
console.log('1. Open your app at http://localhost:3000')
console.log('2. Open browser developer tools (F12)')
console.log('3. Go to Console tab')
console.log('4. Run: testSupabaseConnection()')