import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./db"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

// Minimal JWT configuration - use only if you prefer JWT over database sessions
// To use this: rename this file to auth.ts and rename current auth.ts to auth-database.ts

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      organizationId?: string
    }
  }
  
  interface User {
    id: string
    email: string
    name?: string | null
    image?: string | null
    organizationId?: string
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          }) as any

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          }
        } catch (error) {
          console.error('Database error during authentication:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // Shorter: 7 days instead of 30
    updateAge: 6 * 60 * 60, // Update every 6 hours instead of 24
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-authjs.session-token' : 'authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      },
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
        // Only add organizationId if it exists and is minimal
        if (token.organizationId && typeof token.organizationId === 'string') {
          session.user.organizationId = token.organizationId
        }
      }
      return session
    },
    async jwt({ token, user, trigger }) {
      // Only store absolutely essential data
      if (user) {
        token.sub = user.id
        
        // Only fetch organization on initial sign-in or explicit update
        if (trigger === 'signIn' || trigger === 'update') {
          try {
            const membership = await prisma.organizationMember.findFirst({
              where: { userId: user.id },
              select: { organizationId: true }
            })
            token.organizationId = membership?.organizationId || null
          } catch (error) {
            console.error('Error fetching user organization:', error)
            token.organizationId = null
          }
        }
      }
      
      // Return only essential fields - NO extra data
      return {
        sub: token.sub,
        email: token.email,
        name: token.name,
        picture: token.picture,
        organizationId: token.organizationId,
        iat: token.iat,
        exp: token.exp,
        jti: token.jti,
      }
    },
  },
}) 