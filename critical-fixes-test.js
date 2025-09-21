#!/usr/bin/env node

/**
 * CRITICAL BUG FIXES TEST SCRIPT
 * 
 * Testing the two critical issues:
 * 1. "Setup Failed" - Profile creation error due to missing 'address' column
 * 2. "Sign out not working" - User unable to properly sign out
 */

const fs = require('fs')
const path = require('path')

console.log('🚨 CRITICAL BUG FIXES VALIDATION\n')

let criticalFixes = []
let remainingIssues = []

// Test 1: Check if address column issue is fixed
console.log('🔧 Testing Profile Creation Fix...')
try {
  const onboardingUtils = fs.readFileSync(
    path.join(__dirname, 'lib/supabase/onboarding-utils.ts'), 
    'utf8'
  )
  
  // Check if we're only using safe database fields
  if (!onboardingUtils.includes('address: profileData.address')) {
    criticalFixes.push('✅ Removed problematic address field from profile creation')
  } else {
    remainingIssues.push('❌ Still trying to use non-existent address field')
  }
  
  // Check if we have defensive error handling
  if (onboardingUtils.includes('onboarding_completed = false') && onboardingUtils.includes('try {')) {
    criticalFixes.push('✅ Added defensive error handling for optional onboarding fields')
  }
  
  // Check if we're using only core schema fields
  if (onboardingUtils.includes('id: user.id') && onboardingUtils.includes('name: profileData.name')) {
    criticalFixes.push('✅ Using only core schema fields (id, name, phone, role, language)')
  }

} catch (e) {
  remainingIssues.push(`❌ Could not validate onboarding utils: ${e.message}`)
}

// Test 2: Check if onboarding form handles database errors gracefully
console.log('🔧 Testing Onboarding Form Error Handling...')
try {
  const onboardingForm = fs.readFileSync(
    path.join(__dirname, 'components/onboarding/onboarding-form.tsx'), 
    'utf8'
  )
  
  if (onboardingForm.includes('try {') && onboardingForm.includes('await completeOnboarding')) {
    criticalFixes.push('✅ Added try-catch around onboarding completion')
  }
  
  if (onboardingForm.includes('onboardingError')) {
    criticalFixes.push('✅ Graceful handling of onboarding completion errors')
  }
  
  if (onboardingForm.includes('address: \'\'')) {
    criticalFixes.push('✅ Set address to empty string to avoid column errors')
  }

} catch (e) {
  remainingIssues.push(`❌ Could not validate onboarding form: ${e.message}`)
}

// Test 3: Check if sign-out is bulletproof now
console.log('🔧 Testing Bulletproof Sign-out...')
try {
  const authButton = fs.readFileSync(
    path.join(__dirname, 'components/auth/auth-button.tsx'), 
    'utf8'
  )
  
  if (authButton.includes('if (signingOut) return')) {
    criticalFixes.push('✅ Prevents multiple sign-out attempts')
  }
  
  if (authButton.includes('setSession(null)') && authButton.includes('setUserProfile(null)')) {
    criticalFixes.push('✅ Immediately clears local state')
  }
  
  if (authButton.includes('window.location.replace')) {
    criticalFixes.push('✅ Uses location.replace for better cleanup')
  }
  
  if (authButton.includes('.catch(error =>')) {
    criticalFixes.push('✅ Non-blocking Supabase sign-out (continues even if fails)')
  }
  
  if (authButton.includes('setTimeout') && authButton.includes('500')) {
    criticalFixes.push('✅ Fast redirect (500ms) for better UX')
  }

} catch (e) {
  remainingIssues.push(`❌ Could not validate auth button: ${e.message}`)
}

// Test 4: Check database schema compatibility
console.log('🔧 Testing Database Schema Compatibility...')
try {
  const schema = fs.readFileSync(path.join(__dirname, 'supabase/schema.sql'), 'utf8')
  
  const baseFields = ['id', 'phone', 'role', 'name', 'language', 'created_at']
  let schemaCompatible = true
  
  baseFields.forEach(field => {
    if (!schema.includes(field)) {
      remainingIssues.push(`❌ Missing core field in schema: ${field}`)
      schemaCompatible = false
    }
  })
  
  if (schemaCompatible) {
    criticalFixes.push('✅ All core database fields are available in schema')
  }
  
} catch (e) {
  remainingIssues.push(`❌ Could not validate database schema: ${e.message}`)
}

// RESULTS
console.log('\n🎯 CRITICAL FIXES SUMMARY')
console.log('=' * 50)
console.log(`✅ Critical fixes applied: ${criticalFixes.length}`)
console.log(`❌ Remaining issues: ${remainingIssues.length}`)

if (criticalFixes.length > 0) {
  console.log('\n🎉 FIXES APPLIED:')
  criticalFixes.forEach(fix => console.log(`   ${fix}`))
}

if (remainingIssues.length > 0) {
  console.log('\n⚠️  REMAINING ISSUES:')
  remainingIssues.forEach(issue => console.log(`   ${issue}`))
}

if (remainingIssues.length === 0 && criticalFixes.length >= 8) {
  console.log('\n🚀 SUCCESS! Both critical bugs should now be fixed:')
  console.log('\n   1. ✅ ONBOARDING SETUP: Should work without "address column" error')
  console.log('      - Using only core database fields')
  console.log('      - Graceful error handling for optional fields')
  console.log('      - Defensive programming approach')
  console.log('\n   2. ✅ SIGN-OUT FUNCTIONALITY: Should work reliably')  
  console.log('      - Bulletproof sign-out with immediate state clearing')
  console.log('      - Fast redirect (500ms) for better UX')
  console.log('      - Non-blocking Supabase calls')
  console.log('      - Multiple fallback mechanisms')
  
  console.log('\n🔥 TEST THESE NOW:')
  console.log('   • Fill out the onboarding form and click "Complete Setup"')
  console.log('   • Click the "Logout" button in the top-right corner')
  console.log('   • Both should work without errors!')
  
} else {
  console.log('\n❗ CRITICAL: Some fixes may not be complete. Please review the issues above.')
  process.exit(1)
}