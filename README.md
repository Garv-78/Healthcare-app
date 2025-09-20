# HealthConnect - Telemedicine Platform

A comprehensive telemedicine platform designed for rural healthcare, connecting patients with doctors through secure video consultations, digital health records, and pharmacy integration.

## Features

- 🎥 **Video Consultations** - Secure video calls with doctors
- 📋 **Health Records** - Digital medical history and prescriptions
- 💊 **Pharmacy Integration** - Medicine availability tracking
- 🧠 **AI Symptom Checker** - Preliminary health assessment
- 🌐 **Multi-language Support** - English, Punjabi, and more
- 🔐 **Secure Authentication** - Email/password and Google OAuth
- 📱 **Mobile Responsive** - Works on all devices

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Google OAuth
- **UI Components**: shadcn/ui with Tailwind CSS
- **Language**: TypeScript
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+ installed
- pnpm package manager
- Supabase account

### 1. Clone the Repository

```bash
git clone <repository-url>
cd telemedicine-platform
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   ```bash
   # Get these from your Supabase project dashboard
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

### 4. Get Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select existing project
3. Go to **Settings** → **API**
4. Copy the **Project URL** and **anon/public key**
5. Paste them in your `.env.local` file

### 5. Set Up Database (Optional - if using shared Supabase)

If you're using your own Supabase instance:

1. Run the SQL migrations in `supabase/` folder
2. Set up authentication providers in Supabase Auth settings
3. Configure Google OAuth if needed

### 6. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key | ✅ |
| `NEXT_PUBLIC_APP_URL` | Base URL of your application | ✅ |
| `NEXT_PUBLIC_LIVEKIT_URL` | LiveKit server URL (for video) | ❌ |
| `LIVEKIT_API_KEY` | LiveKit API key | ❌ |
| `LIVEKIT_API_SECRET` | LiveKit API secret | ❌ |

## Project Structure

```
├── app/                    # Next.js 14 app directory
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   ├── consultation/      # Video consultation pages
│   ├── pharmacy/          # Pharmacy pages
│   ├── records/           # Health records pages
│   └── symptoms/          # Symptom checker pages
├── components/            # Reusable UI components
│   ├── auth/             # Authentication components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utility functions and configurations
├── hooks/                 # Custom React hooks
├── public/               # Static assets
├── supabase/             # Database migrations and types
└── types/                # TypeScript type definitions
```

## Key Features

### Authentication
- Email/password registration and login
- Google OAuth integration
- Role-based access (Patient/Doctor)
- Session management with middleware

### User Roles
- **Patients**: Book consultations, view records, check symptoms
- **Doctors**: Manage appointments, create prescriptions, patient records

### Security
- End-to-end encrypted sessions
- Role-based access control
- Secure API routes with authentication

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

Ensure environment variables are properly set in your deployment platform.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add some feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

## Common Issues

### "Supabase client URL and Key required" Error

This means environment variables are not set up correctly. Follow step 3 in "Getting Started" section.

### Build Errors

Make sure all dependencies are installed:
```bash
pnpm install
```

### Authentication Not Working

1. Check Supabase project is active
2. Verify environment variables are correct
3. Ensure Google OAuth is configured in Supabase Auth settings

## Support

For issues and questions:
1. Check existing issues in the repository
2. Create a new issue with detailed description
3. Contact the development team

## License

This project is licensed under the MIT License.