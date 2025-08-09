# FlexHub CMS - Production Deployment Guide

## 1. Environment Variables

Create a `.env.local` file in your production environment with these variables:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database_name"

# NextAuth.js
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-super-secret-key-here-min-32-chars"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Optional: For production logging
NODE_ENV="production"
```

### Generating NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

## 2. Database Setup

### Option A: PostgreSQL (Recommended)
1. Set up a PostgreSQL database (Vercel Postgres, Supabase, Railway, etc.)
2. Get your connection string
3. Update `DATABASE_URL` in your environment variables

### Option B: MySQL
1. Update your `prisma/schema.prisma` to use MySQL:
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

## 3. OAuth Provider Setup

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable YouTube Data API v3 (if using Social Media feature)
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://yourdomain.com/api/auth/callback/google`
6. Copy Client ID and Client Secret

### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Homepage URL: `https://yourdomain.com`
4. Set Authorization callback URL: `https://yourdomain.com/api/auth/callback/github`
5. Copy Client ID and Client Secret

## 4. Database Migration & Seeding

### Initial Setup
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed the database (optional)
npm run seed
```

### Creating Your First Super Admin
After deployment, you'll need to create your first super admin user. You have two options:

#### Option A: Use the Seed Script
Update `scripts/create-super-admin.ts` with your email and run:
```bash
npm run create-super-admin
```

#### Option B: Manual Database Insert
```sql
INSERT INTO "User" (
  id, 
  name, 
  email, 
  role, 
  "isActive", 
  "createdAt", 
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'Your Name',
  'your-email@example.com',
  'SUPERADMIN',
  true,
  NOW(),
  NOW()
);
```

## 5. Deployment Platforms

### Vercel (Recommended)
1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Railway
1. Connect your GitHub repo
2. Add environment variables
3. Railway will auto-deploy

### Netlify
1. Connect your GitHub repo
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables

### Self-Hosted (Docker)
```dockerfile
FROM node:22.11.0-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
```

## 6. Post-Deployment Checklist

- [ ] Database migrations completed
- [ ] First super admin user created
- [ ] OAuth providers configured
- [ ] Environment variables set
- [ ] Domain configured (if using custom domain)
- [ ] SSL certificate active
- [ ] Test sign-in flow
- [ ] Test site switching functionality
- [ ] Test user management
- [ ] Test page management

## 7. Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **Database**: Use strong passwords and restrict access
3. **OAuth**: Use production OAuth apps, not development ones
4. **HTTPS**: Always use HTTPS in production
5. **Secrets**: Rotate secrets regularly

## 8. Monitoring & Maintenance

### Database Backups
Set up regular backups of your database:
```bash
# PostgreSQL backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### Logs
Monitor your application logs for errors and performance issues.

### Updates
Regularly update dependencies:
```bash
npm update
npx prisma migrate dev
```

## 9. Troubleshooting

### Common Issues

1. **Database Connection**: Check `DATABASE_URL` format
2. **OAuth Errors**: Verify callback URLs match exactly
3. **Migration Errors**: Ensure database user has proper permissions
4. **Build Errors**: Check Node.js version compatibility

### Support
If you encounter issues, check:
- Prisma documentation
- NextAuth.js documentation
- Your deployment platform's documentation 