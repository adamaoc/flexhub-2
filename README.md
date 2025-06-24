# FlexHub CMS

A secure, invite-based content management system built with Next.js, NextAuth.js, and Prisma.

## 🚀 Features

- **Invite-only Authentication** - Secure access control via email-based invites
- **OAuth Integration** - Sign in with Google or GitHub
- **Role-based Access Control** - USER, ADMIN, SUPERADMIN roles
- **Database Integration** - PostgreSQL with Prisma ORM
- **Modern UI** - Built with Tailwind CSS and Next.js 15

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Authentication**: NextAuth.js v5
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **OAuth Providers**: Google, GitHub

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- GitHub OAuth App (optional)
- Google OAuth App (optional)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd flex-hub
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the project root:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/flexhub?schema=public"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# GitHub OAuth (Optional)
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Create and run migrations
npm run db:migrate

# Create initial super admin
npm run create-admin
```

### 4. Create User Invites

```bash
# Create invite for a specific email
npm run create-invite user@example.com USER

# Create admin invite
npm run create-invite admin@example.com ADMIN

# Create super admin invite
npm run create-invite superadmin@example.com SUPERADMIN
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` and sign in with an invited email address.

## 🔐 Authentication Flow

1. **Invite Creation** - Super admins create email-based invites
2. **OAuth Sign-in** - Users sign in via Google/GitHub
3. **Invite Validation** - System checks for valid, unused invites
4. **User Creation** - New users are created with assigned roles
5. **Session Management** - JWT-based sessions with role data

## 📧 Invite System

- **Email-based invites** tied to specific addresses
- **Role assignment** during invite creation
- **Expiration dates** (30 days default)
- **Usage tracking** prevents invite reuse
- **Admin oversight** for invite management

## 🛡️ Security Features

- **Invite-only access** - No public registration
- **Role-based permissions** - Granular access control
- **OAuth authentication** - Trusted provider verification
- **JWT sessions** - Secure session management
- **Database validation** - Server-side invite checking

## 📁 Project Structure

```
flex-hub/
├── src/
│   ├── app/
│   │   ├── auth/           # Authentication pages
│   │   ├── api/
│   │   │   ├── auth/       # NextAuth.js API routes
│   │   │   └── health/     # Health check endpoint
│   │   ├── dashboard/      # Protected dashboard
│   │   └── providers.tsx   # NextAuth.js SessionProvider
│   ├── lib/
│   │   ├── auth.ts         # NextAuth.js configuration
│   │   └── prisma.ts       # Prisma client
│   ├── types/
│   │   └── next-auth.d.ts  # NextAuth.js type extensions
│   └── middleware.ts       # Route protection
├── prisma/
│   └── schema.prisma       # Database schema
├── scripts/
│   ├── create-admin.ts     # Super admin creation
│   ├── create-invite.ts    # Invite creation
│   └── check-invite.ts     # Invite status checking
└── NEXTAUTH_SETUP.md       # Detailed setup guide
```

## 🎯 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run create-admin` - Create super admin user
- `npm run create-invite` - Create user invite
- `npm run check-invite` - Check invite status

## 🔧 OAuth Provider Setup

### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set homepage URL to `http://localhost:3000`
4. Set callback URL to `http://localhost:3000/api/auth/callback/github`

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add `http://localhost:3000/api/auth/callback/google` to redirect URIs

## 🚨 Troubleshooting

### Common Issues
- **"Access denied"** - User doesn't have a valid invite
- **OAuth errors** - Check provider configuration
- **Database errors** - Ensure Prisma client is generated
- **Session issues** - Verify `NEXTAUTH_SECRET` is set

### Debug Mode
Enable NextAuth.js debug mode in `.env.local`:
```env
NEXTAUTH_DEBUG=true
```

## 📚 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Detailed Setup Guide](./NEXTAUTH_SETUP.md)


## Prisma after deploy

```
npm run db:generate

npx prisma migrate deploy

npm run setup-production
```

prisma video
https://www.youtube.com/watch?v=_ER9jHiylAo

Auth video
https://www.youtube.com/watch?v=n-fVrzaikBQ

Google Signin managed through txg gcc - 
https://console.cloud.google.com/auth/clients?inv=1&invt=Ab0rRw&project=flexhub-ampnetmedia&supportedpurview=project