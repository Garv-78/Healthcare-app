# Enhanced Profile Page CLI Command

## Quick Start

Run the CLI command to set up the enhanced profile page:

```bash
# Using npm
npm run setup:profile

# Using pnpm (recommended)
pnpm setup:profile

# Using yarn
yarn setup:profile

# Direct execution
node scripts/setup-profile.js
```

## What the CLI Command Does

The `setup:profile` command automatically:

1. **Creates Database Migration** - Generates SQL migration file to add new profile fields
2. **Sets Up Package Scripts** - Adds helpful scripts to your `package.json`
3. **Creates Documentation** - Generates `PROFILE_SETUP.md` with detailed setup instructions
4. **Validates Structure** - Ensures all required files and components are in place

## After Running the Command

1. **Run Database Migration:**
   ```bash
   pnpm db:migrate
   # or manually with Supabase CLI:
   supabase migration up
   ```

2. **Start Development Server:**
   ```bash
   pnpm dev
   ```

3. **Test Profile Functionality:**
   - Navigate to `/profile` in your browser
   - Log in and test profile editing
   - Try uploading a profile picture
   - Verify all form fields work correctly

## Files Created/Modified

- ✅ `scripts/setup-profile.js` - The CLI script itself
- ✅ `supabase/migrations/[timestamp]_enhanced_profile_schema.sql` - Database migration
- ✅ `PROFILE_SETUP.md` - Detailed setup documentation
- ✅ `package.json` - Updated with new scripts

## Already Implemented Components

These files were already created in previous steps:
- ✅ `components/profile/enhanced-profile-page.tsx` - Main profile component
- ✅ `hooks/use-image-upload.ts` - Image upload functionality
- ✅ `hooks/use-character-limit.ts` - Text limit validation
- ✅ `app/api/profile/route.ts` - Profile API endpoints
- ✅ `app/profile/page.tsx` - Profile page routing

## Features Included

- 🎨 **Modern UI Design** - Matches reference design with gradient background
- 📸 **Profile Picture Upload** - Click-to-upload with preview functionality
- 📝 **Comprehensive Forms** - All user information fields with validation
- 🔒 **Role-Based Fields** - Different fields for doctors vs patients
- 📱 **Responsive Design** - Works on all screen sizes
- 🔄 **Real-time Validation** - Character limits and form validation
- 🏠 **Navigation** - Easy return to homepage
- 💾 **Auto-save** - Automatic save and load functionality

## Troubleshooting

If you encounter issues:

1. **Permission Errors:** Run PowerShell as Administrator
2. **Node Not Found:** Ensure Node.js is installed and in PATH
3. **Migration Fails:** Check Supabase configuration and permissions
4. **Components Missing:** Re-run the setup command

## Support

For additional help, refer to:
- `PROFILE_SETUP.md` - Detailed setup guide
- Component documentation in the source files
- Supabase documentation for database setup