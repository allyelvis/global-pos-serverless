"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Customer, Order, OrderItem } from "@/lib/types"
import { formatDate, formatCurrency } from "@/lib/utils"
import { getAllOrders, getOrderItemsByOrderId } from "@/lib/db/orders"

interface CustomerDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  customer: Customer | null
}

export function CustomerDetailsDialog({ isOpen, onClose, customer }: CustomerDetailsDialogProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchOrders = async () => {
      if (!customer) return

      setIsLoading(true)
      try {
        // Fetch all orders
        const allOrders = await getAllOrders()

        // Filter orders for this customer
        const customerOrders = allOrders.filter((order) => order.customerId === customer.id)
        setOrders(customerOrders)

        // Fetch order items for each order
        const itemsMap: Record<string, OrderItem[]> = {}
        for (const order of customerOrders) {
          const items = await getOrderItemsByOrderId(order.id)
          itemsMap[order.id] = items
        }
        setOrderItems(itemsMap)
      } catch (error) {
        console.error("Failed to fetch orders:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen && customer) {
      fetchOrders()
    }
  }, [isOpen, customer])

  if (!customer) return null

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
          <DialogDescription>View detailed information about {customer.name}</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Order History</TabsTrigger>
            <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
                <p>{customer.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Customer Since</h3>
                <p>{formatDate(customer.joinDate)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                <p>{customer.email || "-"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                <p>{customer.phone || "-"}</p>
              </div>
              <div className="col-span-2">
                <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
                <p>{customer.address || "-"}</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(customer.totalSpent)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Last Purchase</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatDate(customer.lastPurchase)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{customer.loyaltyPoints}</div>
                </CardContent>
              </Card>
            </div>
            {customer.notes && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                  <p>{customer.notes}</p>
                </div>
              </>
            )}
          </TabsContent>
          <TabsContent value="orders" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>Recent purchases made by {customer.name}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex h-40 items-center justify-center">
                    <p>Loading orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="flex h-40 flex-col items-center justify-center text-center">
                    <p className="text-lg font-medium">No orders found</p>
                    <p className="text-sm text-muted-foreground">This customer hasn't made any purchases yet.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.orderNumber}</TableCell>
                          <TableCell>{formatDate(order.createdAt)}</TableCell>
                          <TableCell>{orderItems[order.id]?.length || 0}</TableCell>
                          <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(order.status)}`}
                            >
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="loyalty" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Loyalty Program</CardTitle>
                <CardDescription>Loyalty status and rewards for {customer.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Current Points</h3>
                    <p className="text-3xl font-bold">{customer.loyaltyPoints}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Status</h3>
                    <p className="text-3xl font-bold">
                      {customer.loyaltyPoints < 200 ? "Bronze" : customer.loyaltyPoints < 500 ? "Silver" : "Gold"}
                    </p>
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="font-medium mb-2">Available Rewards</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center justify-between rounded-md border p-3">
                      <div>
                        <p className="font-medium">10% Off Next Purchase</p>
                        <p className="text-sm text-muted-foreground">Valid for 30 days</p>
                      </div>
                      <Button size="sm" disabled={customer.loyaltyPoints < 100}>
                        Redeem (100 pts)
                      </Button>
                    </li>
                    <li className="flex items-center justify-between rounded-md border p-3">
                      <div>
                        <p className="font-medium">Free Shipping</p>
                        <p className="text-sm text-muted-foreground">Valid for 30 days</p>
                      </div>
                      <Button size="sm" disabled={customer.loyaltyPoints < 150}>
                        Redeem (150 pts)
                      </Button>
                    </li>
                    <li className="flex items-center justify-between rounded-md border p-3">
                      <div>
                        <p className="font-medium">$25 Gift Card</p>
                        <p className="text-sm text-muted-foreground">Never expires</p>
                      </div>
                      <Button size="sm" disabled={customer.loyaltyPoints < 500}>
                        Redeem (500 pts)
                      </Button>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

