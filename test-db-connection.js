
console.log('Testing database connection...')

const testConnection = async () => {
  try {

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      return
    }
    
    if (!session) {
      console.log('No active session')
      return
    }
    
    console.log('User ID:', session.user.id)
    console.log('User email:', session.user.email)

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    
    if (profileError) {
      console.error('Profile query error:', profileError)
    } else {
      console.log('Current profile:', profile)
      console.log('Available fields:', Object.keys(profile || {}))
    }

    const testUpdate = {
      name: 'Test User',
      email: session.user.email,
      role: 'patient'
    }
    
    console.log('Attempting update with:', testUpdate)
    
    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({
        id: session.user.id,
        ...testUpdate
      })
    
    if (updateError) {
      console.error('Update error:', updateError)
    } else {
      console.log('Update successful!')
    }
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

console.log('To run this test:')
console.log('1. Open browser developer tools (F12)')
console.log('2. Go to your app at http://localhost:3000')
console.log('3. Paste this function in console:')
console.log('testConnection()')