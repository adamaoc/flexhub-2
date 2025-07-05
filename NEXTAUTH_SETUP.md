# FlexHub CMS - NextAuth.js Setup Guide

This guide covers the secure, invite-based authentication system using NextAuth.js with Google and GitHub providers.

## 🚀 Quick Setup

### 1. Environment Variables

Create a `.env.local` file in your project root:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/flexhub?schema=public"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3005"

# GitHub OAuth (Optional)
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 2. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Create and run migrations
npm run db:migrate

# Create super admin and test invites
npm run create-admin
```

### 3. OAuth Provider Setup

#### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set homepage URL to `http://localhost:3005`
4. Set callback URL to `http://localhost:3005/api/auth/callback/github`

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add `http://localhost:3005/api/auth/callback/google` to authorized redirect URIs

## 🔐 How It Works

### Authentication Flow

1. **User clicks sign-in** → Redirected to OAuth provider
2. **OAuth callback** → NextAuth.js processes the response
3. **SignIn callback** → Checks for valid invite or existing user
4. **User creation/validation** → Creates new user or validates existing
5. **Session creation** → JWT session with user role data
6. **Redirect to dashboard** → Protected route access

### Invite-Based Access Control

- **New users** must have a valid, unused invite
- **Existing users** can sign in without invite validation
- **Invites are email-specific** and tied to OAuth email addresses
- **Role assignment** happens during invite creation
- **Usage tracking** prevents invite reuse

### Security Features

- **Invite-only access** - No public registration
- **Role-based permissions** - USER, ADMIN, SUPERADMIN
- **Provider authentication** - Google/GitHub OAuth
- **JWT sessions** - Secure session management
- **Database validation** - Server-side invite checking

## 📧 Managing Invites

### Create Invites via Script

```bash
# Create user invite
npm run create-invite user@example.com USER

# Create admin invite
npm run create-invite admin@example.com ADMIN

# Create super admin invite
npm run create-invite superadmin@example.com SUPERADMIN
```

### Check Invite Status

```bash
npm run check-invite user@example.com
```

### Invite Management Features

- Email-based invites with unique tokens
- Role assignment during creation
- 30-day expiration (configurable)
- Usage tracking and admin oversight
- Super admin can create and manage invites

## 🏗️ Architecture Components

### Database Schema

- **User model** - Extended with role, invite tracking
- **Invite model** - Email-based invites with expiration
- **NextAuth models** - Account, Session, VerificationToken
- **Role enum** - USER, ADMIN, SUPERADMIN

### Authentication Configuration

- **OAuth providers** - Google and GitHub
- **Custom callbacks** - Invite validation, role management
- **JWT strategy** - Secure session handling
- **Custom pages** - Sign-in and error pages

### Route Protection

- **Middleware** - NextAuth.js with custom matcher
- **Protected routes** - All except auth and health endpoints
- **Role-based access** - Extensible for future features

## 🛡️ Security Considerations

### Production Checklist

- [ ] Use strong `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
- [ ] Set up HTTPS in production
- [ ] Configure proper CORS settings
- [ ] Use environment-specific database URLs
- [ ] Set up proper OAuth redirect URIs for production domain
- [ ] Implement rate limiting
- [ ] Add audit logging for invite management
- [ ] Regular security updates

### Environment Variables

- **Development**: Use `.env.local` (automatically ignored by Git)
- **Production**: Use your hosting platform's environment variables
- **Never commit secrets**: Ensure `.env*` files are in `.gitignore`

## 🔧 Customization

### Adding New Providers

1. Install provider package: `npm install @auth/nextjs-provider`
2. Add to `authOptions.providers` in `src/lib/auth.ts`
3. Configure environment variables
4. Update sign-in page UI

### Custom Callbacks

The system includes custom callbacks for:

- **signIn**: Invite validation and user creation
- **session**: Role-based session management
- **jwt**: User data persistence in tokens

### Role-Based Access Control

Extend the middleware for role-specific routes:

```typescript
// Example: Admin-only routes
export const config = {
  matcher: ["/admin/:path*"],
};
```

## 🚨 Troubleshooting

### Common Issues

#### "Access denied" Error

- **Cause**: User doesn't have a valid invite
- **Solution**: Create invite with `npm run create-invite user@email.com ROLE`

#### OAuth Configuration Errors

- **Cause**: Incorrect client ID/secret or redirect URIs
- **Solution**: Verify OAuth app settings and environment variables

#### Database Connection Issues

- **Cause**: Invalid DATABASE_URL or Prisma client not generated
- **Solution**: Check database URL and run `npm run db:generate`

#### Session Issues

- **Cause**: Missing or invalid NEXTAUTH_SECRET
- **Solution**: Generate new secret and restart server

### Debug Mode

Enable NextAuth.js debug mode:

```env
NEXTAUTH_DEBUG=true
```

### Useful Commands

```bash
# Check invite status
npm run check-invite user@example.com

# View database with Prisma Studio
npm run db:studio

# Reset database (development only)
npm run db:reset
```

## 📚 API Reference

### Authentication Endpoints

- `GET/POST /api/auth/signin` - Sign in page
- `GET/POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get current session
- `GET /api/auth/csrf` - CSRF token

### Protected Routes

All routes except `/api/auth/*`, `/api/health`, and `/auth/*` require authentication.

### Health Check

- `GET /api/health` - System health and database connectivity

## 🎯 Next Steps

1. **Set up your database** and run migrations
2. **Configure OAuth providers** (Google/GitHub)
3. **Create initial admin user** with `npm run create-admin`
4. **Test the authentication flow**
5. **Customize the UI** and add role-based features
6. **Deploy to production** with proper environment variables
7. **Add content management features** to the dashboard

## 📖 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [OAuth Provider Setup Guides](https://next-auth.js.org/configuration/providers)

The system is now ready for secure, invite-based authentication with role-based access control!
