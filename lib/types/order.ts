export interface OrderItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  category: string
}

export interface Order {
  id: string
  customerId: string
  items: OrderItem[]
  total: number
  status: "pending" | "completed" | "cancelled"
  paymentMethod: string
  createdAt: string
  updatedAt: string
}

