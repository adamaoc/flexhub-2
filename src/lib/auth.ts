import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('🔐 SignIn callback triggered')
      console.log('User email:', user.email)
      console.log('Provider:', account?.provider)
      
      // First, check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! },
      })

      console.log('Existing user found:', !!existingUser)

      if (existingUser) {
        console.log('✅ Existing user, updating last login')
        // Update last login for existing user
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { lastLogin: new Date() },
        })
        return true
      }

      // For new users, check if they have a valid invite
      const invite = await prisma.invite.findFirst({
        where: {
          email: user.email!,
          isUsed: false,
          expiresAt: {
            gt: new Date(),
          },
        },
      })

      console.log('Invite found for new user:', !!invite)
      if (invite) {
        console.log('Invite details:', {
          email: invite.email,
          role: invite.role,
          expiresAt: invite.expiresAt,
          isUsed: invite.isUsed
        })
      }

      if (!invite) {
        console.log('❌ Access denied: No valid invite found for new user')
        return false // Deny access if not invited
      }

      console.log('🆕 Creating new user with invite role:', invite.role)
      // Create new user with invite role
      await prisma.user.create({
        data: {
          email: user.email!,
          name: user.name,
          image: user.image,
          role: invite.role,
          isInvited: true,
          invitedBy: invite.invitedBy,
          invitedAt: invite.invitedAt,
          lastLogin: new Date(),
        },
      })

      // Mark invite as used
      await prisma.invite.update({
        where: { id: invite.id },
        data: {
          isUsed: true,
          usedAt: new Date(),
        },
      })

      console.log('✅ New user created successfully')
      return true
    },
    async session({ session, token }) {
      // Add user role and ID to session from token
      if (session.user && token) {
        session.user.id = token.userId as string
        session.user.role = token.role as string
        session.user.isActive = token.isActive as boolean
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        // Get user data from database
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        })
        
        if (dbUser) {
          token.userId = dbUser.id
          token.role = dbUser.role
          token.isActive = dbUser.isActive
        }
      }
      return token
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug mode
} 