import NextAuth, { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"
import FacebookProvider from "next-auth/providers/facebook"
import TwitterProvider from "next-auth/providers/twitter"
import { loginUser, createOrGetUserFromOAuth } from "@/lib/db/users"
import { isValidEmail } from "@/lib/validation"
import { cookies } from "next/headers"
import logger from "@/lib/logger"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        if (!isValidEmail(credentials.email)) {
          return null
        }

        try {
          const result = await loginUser(credentials.email, credentials.password)

          if (result.success && result.user) {
            // Set system setup complete cookie
            cookies().set("system_setup_complete", "true", {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              maxAge: 60 * 60 * 24 * 365, // 1 year
              path: "/",
              sameSite: "lax",
            })

            logger.info("User authenticated via NextAuth credentials", { userId: result.user.id })

            return {
              id: result.user.id,
              name: result.user.name,
              email: result.user.email,
              role: result.user.role,
              businessId: result.user.businessId,
            }
          }

          logger.warn("NextAuth credentials authentication failed", { email: credentials.email })
          return null
        } catch (error) {
          logger.error("NextAuth credentials error", error as Error, { email: credentials.email })
          return null
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID || "",
      clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
      version: "2.0",
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        // For OAuth providers, we need to create a user in our database if they don't exist
        if (account.provider !== "credentials") {
          try {
            const oauthUser = await createOrGetUserFromOAuth(
              {
                email: user.email as string,
                name: user.name,
                image: user.image,
              },
              account.provider,
              account.providerAccountId as string,
            )

            if (oauthUser) {
              token.id = oauthUser.id
              token.role = oauthUser.role
              token.businessId = oauthUser.businessId

              // Set system setup complete cookie
              cookies().set("system_setup_complete", "true", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 60 * 24 * 365, // 1 year
                path: "/",
                sameSite: "lax",
              })

              logger.info("User authenticated via OAuth", {
                userId: oauthUser.id,
                provider: account.provider,
              })
            }
          } catch (error) {
            logger.error("OAuth user creation error", error as Error, {
              provider: account.provider,
              email: user.email,
            })
          }
        } else {
          // For credentials provider
          token.id = user.id
          token.role = user.role
          token.businessId = user.businessId
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.businessId = token.businessId as string
      }

      return session
    },
    async signIn({ user, account, profile }) {
      // Ensure the user has an email
      if (!user.email) {
        logger.warn("Sign-in rejected: No email provided", {
          provider: account?.provider,
          userId: user.id,
        })
        return false
      }

      // No domain restrictions - accept any email domain
      return true
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
    newUser: "/dashboard/profile", // Redirect new users to complete their profile
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

