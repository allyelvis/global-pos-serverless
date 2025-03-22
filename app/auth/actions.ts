"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createUser, getUserByEmail, loginUser as dbLoginUser } from "@/lib/db/users"
import { createBusiness } from "@/lib/db/business"
import { generateId } from "@/lib/utils"
import { isValidEmail } from "@/lib/validation"
import logger from "@/lib/logger"

// Register a new user and business
export async function register({
  name,
  email,
  password,
  businessType,
}: {
  name: string
  email: string
  password: string
  businessType: string
}) {
  try {
    // Validate inputs
    if (!name || !email || !password || !businessType) {
      return { success: false, message: "All fields are required" }
    }

    if (!isValidEmail(email)) {
      return { success: false, message: "Invalid email address" }
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return { success: false, message: "User with this email already exists" }
    }

    // Create business first
    const businessId = generateId()
    const business = await createBusiness({
      id: businessId,
      name: `${name}'s Business`,
      type: businessType as any,
      address: "",
      phone: "",
      email: email,
      currency: "USD",
      taxRate: 0,
      timeZone: "UTC",
    })

    if (!business) {
      return { success: false, message: "Failed to create business" }
    }

    // Create user
    const user = await createUser({
      name,
      email,
      password,
      role: "admin",
      businessId,
    })

    if (!user) {
      return { success: false, message: "Failed to create user" }
    }

    // Log the successful registration
    logger.info("User registered successfully", { userId: user.id, businessId })

    // Set system setup complete cookie
    cookies().set("system_setup_complete", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
      sameSite: "lax",
    })

    // Login the user
    const loginResult = await dbLoginUser(email, password)

    if (!loginResult.success) {
      return { success: true, message: "Registration successful, but automatic login failed. Please log in manually." }
    }

    return { success: true, message: "Registration successful" }
  } catch (error) {
    logger.error("Registration error", error as Error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

// Login a user
export async function login({
  email,
  password,
}: {
  email: string
  password: string
}) {
  try {
    // Validate inputs
    if (!email || !password) {
      return { success: false, message: "Email and password are required" }
    }

    if (!isValidEmail(email)) {
      return { success: false, message: "Invalid email address" }
    }

    // Login the user
    const result = await dbLoginUser(email, password)

    // Log the login attempt
    if (result.success) {
      logger.info("User logged in successfully", { email })
    } else {
      logger.warn("Login failed", { email })
    }

    return result
  } catch (error) {
    logger.error("Login error", error as Error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

// Logout a user
export async function logout() {
  // Clear the session cookie
  cookies().delete("session_id")

  // Redirect to login page
  redirect("/login")
}

// Get current user
export async function getUser() {
  try {
    const sessionId = cookies().get("session_id")?.value

    if (!sessionId) {
      return null
    }

    // Simulate fetching user data
    const user = {
      id: "user-123",
      name: "John Doe",
      email: "john.doe@example.com",
      role: "admin",
      businessId: "business-456",
    }

    return user
  } catch (error) {
    console.error("Failed to get user:", error)
    return null
  }
}

