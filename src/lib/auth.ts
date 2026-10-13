import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  // ── Session strategy ────────────────────────────────────────────
  // 'jwt' means the session is stored in an HTTP-only cookie as a
  // signed token — nothing saved in the database per session.
  // This is better for serverless (Vercel) where you can't keep
  // server-side sessions in memory between requests.
  session: { strategy: 'jwt' },

  // ── Pages ───────────────────────────────────────────────────────
  // Tell Auth.js where YOUR custom login page lives instead of
  // using its default built-in UI
  pages: {
    signIn: '/login',
    error:  '/login',
  },

  // ── Providers ───────────────────────────────────────────────────
  // Each provider is a login method
  providers: [
    // 1. Google OAuth — one-click login with Google account
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // 2. Email + Password (Credentials)
    Credentials({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        // This function runs when someone submits the login form.
        // Return a user object = login success
        // Return null = login failed

        if (!credentials?.email || !credentials?.password) return null

        // Look up the user in the database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.passwordHash) return null

        // Compare the entered password against the stored hash
        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!passwordMatch) return null

        // Return the user — Auth.js puts this in the JWT token
        return {
          id:    user.id,
          email: user.email,
          name:  user.name,
          role:  user.role,
        }
      },
    }),
  ],

  // ── Callbacks ───────────────────────────────────────────────────
  // Callbacks let you customize what goes into the token and session.
  // By default the session only contains name, email, image.
  // We add 'id' and 'role' because we need them everywhere —
  // middleware uses role to protect /admin routes,
  // API routes use id to scope queries to the current user.
  callbacks: {
    async jwt({ token, user }) {
      // 'user' is only available on the first sign-in
      // After that, the token is read from the cookie directly
      if (user) {
        token.id   = user.id
        token.role = (user as any).role
      }
      return token
    },

    async session({ session, token }) {
      // Copy id and role from the token into the session object
      // so components can access session.user.id and session.user.role
      if (token) {
        session.user.id   = token.id   as string
        session.user.role = token.role as string
      }
      return session
    },
  },
})