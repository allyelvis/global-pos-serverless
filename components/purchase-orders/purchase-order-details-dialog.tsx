"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Eye, FileText, Printer } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"

// Define the purchase order type
interface PurchaseOrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}

interface PurchaseOrder {
  id: string
  orderNumber: string
  supplierId: string
  supplierName: string
  orderDate: string
  expectedDeliveryDate?: string
  status: "draft" | "pending" | "approved" | "received" | "cancelled"
  notes?: string
  items: PurchaseOrderItem[]
  createdAt: string
  updatedAt: string
}

interface PurchaseOrderDetailsDialogProps {
  purchaseOrder: PurchaseOrder
  onPrint?: (id: string) => void
}

export function PurchaseOrderDetailsDialog({ purchaseOrder, onPrint }: PurchaseOrderDetailsDialogProps) {
  const [open, setOpen] = useState(false)

  // Calculate total
  const calculateTotal = () => {
    return purchaseOrder.items.reduce((total, item) => total + item.quantity * item.unitPrice, 0)
  }

  // Get status badge color
  const getStatusBadge = (status: PurchaseOrder["status"]) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Draft</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "approved":
        return <Badge variant="default">Approved</Badge>
      case "received":
        return <Badge variant="success">Received</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handlePrint = () => {
    if (onPrint) {
      onPrint(purchaseOrder.id)
    } else {
      window.print()
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Purchase Order #{purchaseOrder.orderNumber}</span>
            {getStatusBadge(purchaseOrder.status)}
          </DialogTitle>
          <DialogDescription>Created on {formatDate(new Date(purchaseOrder.createdAt))}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Header Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Supplier</h3>
              <p className="text-base font-medium">{purchaseOrder.supplierName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Order Date</h3>
              <p className="text-base font-medium">{formatDate(new Date(purchaseOrder.orderDate))}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Expected Delivery</h3>
              <p className="text-base font-medium">
                {purchaseOrder.expectedDeliveryDate
                  ? formatDate(new Date(purchaseOrder.expectedDeliveryDate))
                  : "Not specified"}
              </p>
            </div>
          </div>

          {/* Notes */}
          {purchaseOrder.notes && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
              <p className="text-base">{purchaseOrder.notes}</p>
            </div>
          )}

          <Separator />

          {/* Items */}
          <div>
            <h3 className="text-lg font-medium mb-4">Order Items</h3>
            <div className="space-y-3">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground px-4">
                <div className="col-span-5">Product</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Unit Price</div>
                <div className="col-span-3 text-right">Subtotal</div>
              </div>

              {/* Items */}
              {purchaseOrder.items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">{item.productName}</div>
                      <div className="col-span-2 text-center">{item.quantity}</div>
                      <div className="col-span-2 text-right">{formatCurrency(item.unitPrice)}</div>
                      <div className="col-span-3 text-right font-medium">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Total */}
              <div className="flex justify-end pt-4 border-t">
                <div className="text-right">
                  <span className="block text-sm text-muted-foreground">Total</span>
                  <span className="text-xl font-bold">{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

