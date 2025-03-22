"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import redis from "./redis"
import type { User } from "../types"
import { generateId } from "../utils"
import * as bcrypt from "bcryptjs"

const USERS_KEY = "users"
const SESSIONS_KEY = "sessions"
const OAUTH_ACCOUNTS_KEY = "oauth_accounts"

// Get user by ID
export async function getUserById(id: string): Promise<User | null> {
  try {
    const user = await redis.hget(USERS_KEY, id)
    return user ? (JSON.parse(user) as User) : null
  } catch (error) {
    console.error(`Failed to fetch user ${id}:`, error)
    return null
  }
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const usersMap = (await redis.hgetall(USERS_KEY)) || {}
    const users = Object.values(usersMap).map((item) => JSON.parse(item as string)) as User[]
    return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null
  } catch (error) {
    console.error(`Failed to fetch user by email ${email}:`, error)
    return null
  }
}

// Create a new user
export async function createUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User | null> {
  try {
    // Check if user with this email already exists
    const existingUser = await getUserByEmail(userData.email)
    if (existingUser) {
      throw new Error("User with this email already exists")
    }

    const id = generateId()

    // Hash the password if provided
    let hashedPassword = userData.password
    if (userData.password) {
      hashedPassword = await bcrypt.hash(userData.password, 10)
    }

    const now = new Date().toISOString()

    const user: User = {
      id,
      ...userData,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    }

    // Store user without password in Redis
    const userToStore = { ...user }
    delete userToStore.password

    // Convert to string before storing
    const userJson = JSON.stringify(userToStore)

    // Store in Redis with error handling
    try {
      const result = await redis.hset(USERS_KEY, id, userJson)
      if (!result) {
        console.warn(`User ${id} may not have been stored properly`)
      }
    } catch (redisError) {
      console.error("Redis storage error:", redisError)
      throw new Error(`Failed to store user: ${redisError.message}`)
    }

    return user
  } catch (error) {
    console.error("Failed to create user:", error)
    return null
  }
}

// Update an existing user
export async function updateUser(id: string, userData: Partial<User>): Promise<User | null> {
  try {
    const existingUser = await getUserById(id)
    if (!existingUser) return null

    // If updating password, hash it
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10)
    }

    const updatedUser: User = {
      ...existingUser,
      ...userData,
      updatedAt: new Date().toISOString(),
    }

    // Remove password before storing
    const userToStore = { ...updatedUser }
    delete userToStore.password

    await redis.hset(USERS_KEY, id, JSON.stringify(userToStore))
    revalidatePath("/dashboard/profile")
    return updatedUser
  } catch (error) {
    console.error(`Failed to update user ${id}:`, error)
    return null
  }
}

// Login user
export async function loginUser(
  email: string,
  password: string,
): Promise<{ success: boolean; message: string; user?: User }> {
  try {
    const user = await getUserByEmail(email)

    if (!user) {
      return { success: false, message: "Invalid email or password" }
    }

    // Get the hashed password from Redis
    const userWithPassword = await redis.hget(USERS_KEY, user.id)
    if (!userWithPassword) {
      return { success: false, message: "User not found" }
    }

    const parsedUser = JSON.parse(userWithPassword) as User

    // Verify password
    const passwordMatch = await bcrypt.compare(password, parsedUser.password || "")

    if (!passwordMatch) {
      return { success: false, message: "Invalid email or password" }
    }

    // Create a session
    const sessionId = generateId()
    const now = new Date().toISOString()
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString() // 7 days

    const session = {
      id: sessionId,
      userId: user.id,
      createdAt: now,
      expiresAt,
    }

    await redis.hset(SESSIONS_KEY, sessionId, JSON.stringify(session))

    // Update last login time
    await updateUser(user.id, { lastLoginAt: new Date() })

    // Set session cookie
    cookies().set("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return { success: true, message: "Login successful", user }
  } catch (error) {
    console.error("Failed to login user:", error)
    return { success: false, message: "An error occurred during login" }
  }
}

// Logout user
export async function logoutUser(): Promise<boolean> {
  try {
    const sessionId = cookies().get("session_id")?.value

    if (sessionId) {
      await redis.hdel(SESSIONS_KEY, sessionId)
      cookies().delete("session_id")
    }

    return true
  } catch (error) {
    console.error("Failed to logout user:", error)
    return false
  }
}

// Get current user from session
export async function getCurrentUser(): Promise<User | null> {
  try {
    const sessionId = cookies().get("session_id")?.value

    if (!sessionId) {
      return null
    }

    const sessionData = await redis.hget(SESSIONS_KEY, sessionId)

    if (!sessionData) {
      return null
    }

    const session = JSON.parse(sessionData as string)

    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      await redis.hdel(SESSIONS_KEY, sessionId)
      cookies().delete("session_id")
      return null
    }

    return await getUserById(session.userId)
  } catch (error) {
    console.error("Failed to get current user:", error)
    return null
  }
}

// Link OAuth account to user
export async function linkOAuthAccount(
  userId: string,
  provider: string,
  providerAccountId: string,
  providerData: Record<string, any>,
): Promise<boolean> {
  try {
    const oauthKey = `${provider}:${providerAccountId}`

    // Check if this OAuth account is already linked to another user
    const existingLinkData = await redis.hget(OAUTH_ACCOUNTS_KEY, oauthKey)

    if (existingLinkData) {
      const existingLink = JSON.parse(existingLinkData as string)
      if (existingLink.userId !== userId) {
        return false // Already linked to another user
      }
    }

    const linkData = {
      userId,
      provider,
      providerAccountId,
      providerData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await redis.hset(OAUTH_ACCOUNTS_KEY, oauthKey, JSON.stringify(linkData))
    return true
  } catch (error) {
    console.error("Failed to link OAuth account:", error)
    return false
  }
}

// Get user by OAuth account
export async function getUserByOAuthAccount(provider: string, providerAccountId: string): Promise<User | null> {
  try {
    const oauthKey = `${provider}:${providerAccountId}`
    const linkData = await redis.hget(OAUTH_ACCOUNTS_KEY, oauthKey)

    if (!linkData) return null

    const { userId } = JSON.parse(linkData as string)
    return await getUserById(userId)
  } catch (error) {
    console.error("Failed to get user by OAuth account:", error)
    return null
  }
}

// Create or get user from OAuth profile
export async function createOrGetUserFromOAuth(
  profile: {
    email: string
    name?: string
    image?: string
  },
  provider: string,
  providerAccountId: string,
): Promise<User | null> {
  try {
    // First check if we already have this OAuth account linked
    const existingUser = await getUserByOAuthAccount(provider, providerAccountId)
    if (existingUser) return existingUser

    // Then check if we have a user with this email
    const userByEmail = await getUserByEmail(profile.email)

    if (userByEmail) {
      // Link this OAuth account to the existing user
      await linkOAuthAccount(userByEmail.id, provider, providerAccountId, {})
      return userByEmail
    }

    // Create a new user
    const newUser = await createUser({
      name: profile.name || profile.email.split("@")[0],
      email: profile.email,
      password: generateId(), // Random password since they'll use OAuth
      role: "admin", // Default role
      businessId: "default", // Default business
    })

    if (newUser) {
      // Link the OAuth account to the new user
      await linkOAuthAccount(newUser.id, provider, providerAccountId, {})
    }

    return newUser
  } catch (error) {
    console.error("Failed to create or get user from OAuth:", error)
    return null
  }
}

// Create default admin user
export async function createDefaultAdminUser(): Promise<User | null> {
  try {
    const email = "admin@aenzbi.com"
    const password = "adminsystem"

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      console.log("Default admin user already exists")
      return existingUser
    }

    // Create the default admin user
    const user = await createUser({
      name: "System Administrator",
      email,
      password,
      role: "admin",
      businessId: "default",
      isSystemAdmin: true,
    })

    if (user) {
      console.log("Default admin user created successfully")
    }

    return user
  } catch (error) {
    console.error("Failed to create default admin user:", error)
    return null
  }
}

// Seed initial users data if none exists
export async function seedUsersIfEmpty(): Promise<void> {
  try {
    const usersCount = await redis.hlen(USERS_KEY)

    if (usersCount === 0) {
      // First create the default admin user
      await createDefaultAdminUser()

      // Then create other sample users
      const initialUsers: Array<Omit<User, "id" | "createdAt" | "updatedAt">> = [
        {
          name: "Manager User",
          email: "manager@example.com",
          password: "password123",
          role: "manager",
          businessId: "default",
        },
        {
          name: "Cashier User",
          email: "cashier@example.com",
          password: "password123",
          role: "cashier",
          businessId: "default",
        },
      ]

      for (const user of initialUsers) {
        await createUser(user)
      }

      console.log("Seeded initial users data")
    } else {
      // Even if users exist, ensure the default admin exists
      await createDefaultAdminUser()
    }
  } catch (error) {
    console.error("Failed to seed users:", error)
  }
}

