"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createCustomer, updateCustomer } from "@/lib/db/customers"
import type { Customer } from "@/lib/types"

interface CustomerFormProps {
  isOpen: boolean
  onClose: () => void
  customer: Customer | null
  onCustomerUpdated: (customer: Customer) => void
}

export function CustomerForm({ isOpen, onClose, customer, onCustomerUpdated }: CustomerFormProps) {
  const [formData, setFormData] = useState<
    Omit<Customer, "id" | "createdAt" | "updatedAt" | "totalSpent" | "lastPurchase" | "loyaltyPoints">
  >({
    name: "",
    email: "",
    phone: "",
    address: "",
    businessId: "default",
    joinDate: new Date().toISOString().split("T")[0],
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
        businessId: customer.businessId,
        joinDate: customer.joinDate.split("T")[0],
        notes: customer.notes || "",
      })
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        businessId: "default",
        joinDate: new Date().toISOString().split("T")[0],
        notes: "",
      })
    }
  }, [customer])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (customer) {
        // Update existing customer
        const updatedCustomer = await updateCustomer(customer.id, formData)

        if (updatedCustomer) {
          toast({
            title: "Customer updated",
            description: "The customer has been updated successfully.",
          })
          onCustomerUpdated(updatedCustomer)
          onClose()
        } else {
          throw new Error("Failed to update customer")
        }
      } else {
        // Create new customer
        const newCustomer = await createCustomer({
          ...formData,
          totalSpent: 0,
          lastPurchase: new Date().toISOString(),
          loyaltyPoints: 0,
        })

        if (newCustomer) {
          toast({
            title: "Customer created",
            description: "The customer has been created successfully.",
          })
          onCustomerUpdated(newCustomer)
          onClose()
        } else {
          throw new Error("Failed to create customer")
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error saving the customer.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{customer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
            <DialogDescription>
              {customer ? "Update the customer details below." : "Fill in the details to add a new customer."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" name="address" value={formData.address} onChange={handleChange} rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="joinDate">Join Date</Label>
              <Input
                id="joinDate"
                name="joinDate"
                type="date"
                value={formData.joinDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : customer ? (
                "Update Customer"
              ) : (
                "Add Customer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

