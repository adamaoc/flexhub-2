# Quick Deployment Checklist

## Pre-Deployment
- [ ] Push code to GitHub repository
- [ ] Set up production database (PostgreSQL recommended)
- [ ] Configure OAuth providers (Google & GitHub)
- [ ] Generate NEXTAUTH_SECRET: `openssl rand -base64 32`

## Environment Variables
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXTAUTH_URL` - Your production domain (https://yourdomain.com)
- [ ] `NEXTAUTH_SECRET` - 32+ character secret
- [ ] `GOOGLE_CLIENT_ID` - From Google Cloud Console
- [ ] `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- [ ] `GITHUB_CLIENT_ID` - From GitHub Developer Settings
- [ ] `GITHUB_CLIENT_SECRET` - From GitHub Developer Settings

## OAuth Callback URLs
- [ ] Google: `https://yourdomain.com/api/auth/callback/google`
- [ ] GitHub: `https://yourdomain.com/api/auth/callback/github`

## Post-Deployment
- [ ] Run database migrations: `npx prisma migrate deploy`
- [ ] Generate Prisma client: `npx prisma generate`
- [ ] Create first super admin: `npm run setup-production`
- [ ] Test sign-in flow
- [ ] Test site switching
- [ ] Test user management
- [ ] Test page management

## Security
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] OAuth apps configured for production

## Monitoring
- [ ] Set up error logging
- [ ] Monitor database performance
- [ ] Set up backups
- [ ] Test restore process 