import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./lib/db"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
// import { config } from "./env"

// Ensure this only runs on the server
if (typeof window !== 'undefined') {
  throw new Error('Auth configuration cannot be imported on the client side')
}

// Extend NextAuth types to include organizationId
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

declare module "next-auth" {
  interface JWT {
    id: string
    email: string
    name?: string | null
    image?: string | null
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

          // Email verification is temporarily disabled
          // Check if email is verified
          // if (!user.emailVerified) {
          //   // Return null to indicate authentication failure, but log the specific reason
          //   console.log('Email not verified for user:', user.email)
          //   return null
          // }

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
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.image = user.image
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.image as string
        
        // Get user's organization membership efficiently
        try {
          const membership = await prisma.organizationMember.findFirst({
            where: { userId: token.id as string },
            select: { organizationId: true }
          })
          if (membership) {
            session.user.organizationId = membership.organizationId
          }
        } catch (error) {
          console.error('Error fetching user organization:', error)
        }
      }
      return session
    },
  },
}) 