import { z } from "zod"

// Email validation schema
export const emailSchema = z
  .string()
  .min(1, { message: "Email is required" })
  .email({ message: "Please enter a valid email address" })

// Password validation schema with stronger requirements
export const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
  .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
  .regex(/[0-9]/, { message: "Password must contain at least one number" })
  .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" })

// Login form schema
export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Password is required" }),
  remember: z.boolean().optional(),
})

// Registration form schema
export const registerFormSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
    businessName: z.string().optional(),
    businessType: z.string().min(1, { message: "Business type is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

// Business schema
export const businessSchema = z.object({
  name: z.string().min(1, { message: "Business name is required" }),
  type: z.enum(["retail", "restaurant", "salon", "hotel", "grocery"]),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: emailSchema.optional(),
  currency: z.string().min(1, { message: "Currency is required" }),
  taxRate: z.number().min(0).max(100),
  timeZone: z.string().optional(),
  ownerId: z.string().min(1, { message: "Owner ID is required" }),
})

// User profile update schema
export const userProfileSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: emailSchema,
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmNewPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // If any password field is filled, all must be filled
      const hasCurrentPassword = !!data.currentPassword
      const hasNewPassword = !!data.newPassword
      const hasConfirmPassword = !!data.confirmNewPassword

      if (hasCurrentPassword || hasNewPassword || hasConfirmPassword) {
        return hasCurrentPassword && hasNewPassword && hasConfirmPassword
      }
      return true
    },
    {
      message: "All password fields must be filled to change password",
      path: ["newPassword"],
    },
  )
  .refine(
    (data) => {
      if (data.newPassword && data.confirmNewPassword) {
        return data.newPassword === data.confirmNewPassword
      }
      return true
    },
    {
      message: "New passwords do not match",
      path: ["confirmNewPassword"],
    },
  )

// Validate email function
export function isValidEmail(email: string): boolean {
  return emailSchema.safeParse(email).success
}

// Validate password function
export function isValidPassword(password: string): boolean {
  return passwordSchema.safeParse(password).success
}

// Validate password with detailed feedback
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const result = passwordSchema.safeParse(password)

  if (result.success) {
    return { valid: true, errors: [] }
  }

  // Extract error messages
  const errors = result.error.errors.map((err) => err.message)
  return { valid: false, errors }
}

