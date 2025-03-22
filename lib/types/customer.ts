export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  purchaseHistory: string[] // Array of product IDs
  loyaltyPoints: number
  createdAt: string
  updatedAt: string
}

