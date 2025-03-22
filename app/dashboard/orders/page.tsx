"use client"

import { useState } from "react"
import { Eye, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OrderDetailsDialog } from "@/components/orders/order-details-dialog"

// Sample order data
const orders = [
  {
    id: "1",
    orderNumber: "ORD-001",
    customer: "John Doe",
    date: "2023-05-15T10:30:00Z",
    status: "completed",
    paymentMethod: "credit_card",
    total: 149.97,
    items: [
      { id: "1", name: "T-Shirt", price: 19.99, quantity: 2 },
      { id: "2", name: "Jeans", price: 49.99, quantity: 1 },
      { id: "4", name: "Backpack", price: 39.99, quantity: 1 },
    ],
  },
  {
    id: "2",
    orderNumber: "ORD-002",
    customer: "Alice Smith",
    date: "2023-05-15T11:45:00Z",
    status: "completed",
    paymentMethod: "cash",
    total: 89.99,
    items: [{ id: "6", name: "Headphones", price: 89.99, quantity: 1 }],
  },
  {
    id: "3",
    orderNumber: "ORD-003",
    customer: "Robert Johnson",
    date: "2023-05-15T13:15:00Z",
    status: "completed",
    paymentMethod: "credit_card",
    total: 129.99,
    items: [{ id: "5", name: "Watch", price: 129.99, quantity: 1 }],
  },
  {
    id: "4",
    orderNumber: "ORD-004",
    customer: "Emily Brown",
    date: "2023-05-15T14:30:00Z",
    status: "pending",
    paymentMethod: "credit_card",
    total: 79.99,
    items: [{ id: "3", name: "Sneakers", price: 79.99, quantity: 1 }],
  },
  {
    id: "5",
    orderNumber: "ORD-005",
    customer: "Michael Wilson",
    date: "2023-05-15T15:45:00Z",
    status: "completed",
    paymentMethod: "cash",
    total: 159.98,
    items: [
      { id: "1", name: "T-Shirt", price: 19.99, quantity: 3 },
      { id: "4", name: "Backpack", price: 39.99, quantity: 2 },
    ],
  },
  {
    id: "6",
    orderNumber: "ORD-006",
    customer: "Sarah Brown",
    date: "2023-05-15T16:30:00Z",
    status: "cancelled",
    paymentMethod: "credit_card",
    total: 599.99,
    items: [{ id: "7", name: "Smartphone", price: 599.99, quantity: 1 }],
  },
  {
    id: "7",
    orderNumber: "ORD-007",
    customer: "David Lee",
    date: "2023-05-15T17:15:00Z",
    status: "completed",
    paymentMethod: "credit_card",
    total: 999.99,
    items: [{ id: "8", name: "Laptop", price: 999.99, quantity: 1 }],
  },
  {
    id: "8",
    orderNumber: "ORD-008",
    customer: "Olivia Wilson",
    date: "2023-05-15T18:00:00Z",
    status: "refunded",
    paymentMethod: "credit_card",
    total: 89.99,
    items: [{ id: "6", name: "Headphones", price: 89.99, quantity: 1 }],
  },
]

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<(typeof orders)[0] | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

  const filteredOrders = orders.filter(
    (order) =>
      (statusFilter === "all" || order.status === statusFilter) &&
      (order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleViewDetails = (order: (typeof orders)[0]) => {
    setSelectedOrder(order)
    setIsDetailsDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date)
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "refunded":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case "credit_card":
        return "Credit Card"
      case "cash":
        return "Cash"
      case "debit_card":
        return "Debit Card"
      case "mobile_payment":
        return "Mobile Payment"
      default:
        return method
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Orders</h2>
      </div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search orders..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{formatDate(order.date)}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                        order.status,
                      )}`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>{formatPaymentMethod(order.paymentMethod)}</TableCell>
                  <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleViewDetails(order)}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View details</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <OrderDetailsDialog
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        order={selectedOrder}
      />
    </div>
  )
}

