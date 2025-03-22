"use client"

import { useEffect, useState } from "react"
import { Edit, Eye, Plus, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PurchaseOrderForm } from "@/components/purchase-orders/purchase-order-form"
import { DeletePurchaseOrderDialog } from "@/components/purchase-orders/delete-purchase-order-dialog"
import { PurchaseOrderDetailsDialog } from "@/components/purchase-orders/purchase-order-details-dialog"
import { getAllPurchaseOrders } from "@/lib/db/purchase-orders"
import { getAllSuppliers } from "@/lib/db/suppliers"
import type { PurchaseOrder, Supplier } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { initializeDatabase } from "@/lib/db/init"

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState<PurchaseOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Initialize database if needed
        await initializeDatabase()

        // Fetch purchase orders and suppliers
        const [purchaseOrdersData, suppliersData] = await Promise.all([getAllPurchaseOrders(), getAllSuppliers()])

        setPurchaseOrders(purchaseOrdersData)
        setSuppliers(suppliersData)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredPurchaseOrders = purchaseOrders.filter(
    (po) =>
      (statusFilter === "all" || po.status === statusFilter) &&
      (po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getSupplierName(po.supplierId).toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const getSupplierName = (supplierId: string): string => {
    const supplier = suppliers.find((s) => s.id === supplierId)
    return supplier ? supplier.name : "Unknown Supplier"
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
      case "sent":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "received":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "partially_received":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const handleEdit = (purchaseOrder: PurchaseOrder) => {
    setSelectedPurchaseOrder(purchaseOrder)
    setIsFormOpen(true)
  }

  const handleDelete = (purchaseOrder: PurchaseOrder) => {
    setSelectedPurchaseOrder(purchaseOrder)
    setIsDeleteDialogOpen(true)
  }

  const handleViewDetails = (purchaseOrder: PurchaseOrder) => {
    setSelectedPurchaseOrder(purchaseOrder)
    setIsDetailsDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Purchase Orders</h2>
        <Button
          onClick={() => {
            setSelectedPurchaseOrder(null)
            setIsFormOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Purchase Order
        </Button>
      </div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search purchase orders..."
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
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="received">Received</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="partially_received">Partially Received</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO #</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Expected Delivery</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Loading purchase orders...
                </TableCell>
              </TableRow>
            ) : filteredPurchaseOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No purchase orders found.
                </TableCell>
              </TableRow>
            ) : (
              filteredPurchaseOrders.map((po) => (
                <TableRow key={po.id}>
                  <TableCell className="font-medium">{po.poNumber}</TableCell>
                  <TableCell>{getSupplierName(po.supplierId)}</TableCell>
                  <TableCell>{formatDate(po.createdAt)}</TableCell>
                  <TableCell>{po.expectedDeliveryDate ? formatDate(po.expectedDeliveryDate) : "-"}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeClass(po.status)}>
                      {po.status.charAt(0).toUpperCase() + po.status.slice(1).replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(po.total)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <span className="sr-only">Open menu</span>
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 15 15"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                          >
                            <path
                              d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
                              fill="currentColor"
                              fillRule="evenodd"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewDetails(po)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(po)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(po)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PurchaseOrderForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        purchaseOrder={selectedPurchaseOrder}
        suppliers={suppliers}
        onPurchaseOrderUpdated={(updatedPO) => {
          if (selectedPurchaseOrder) {
            // Update existing purchase order
            setPurchaseOrders(purchaseOrders.map((po) => (po.id === updatedPO.id ? updatedPO : po)))
          } else {
            // Add new purchase order
            setPurchaseOrders([...purchaseOrders, updatedPO])
          }
        }}
      />

      <DeletePurchaseOrderDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        purchaseOrder={selectedPurchaseOrder}
        onPurchaseOrderDeleted={(deletedPOId) => {
          setPurchaseOrders(purchaseOrders.filter((po) => po.id !== deletedPOId))
        }}
      />

      <PurchaseOrderDetailsDialog
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        purchaseOrder={selectedPurchaseOrder}
        suppliers={suppliers}
      />
    </div>
  )
}

