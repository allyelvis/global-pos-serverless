"use client"

import type React from "react"

import { useState } from "react"
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
import { Switch } from "@/components/ui/switch"
import { createSupplier, updateSupplier } from "@/lib/db/suppliers"
import { useToast } from "@/hooks/use-toast"
import type { Supplier } from "@/lib/types"

interface SupplierFormProps {
  isOpen: boolean
  onClose: () => void
  supplier: Supplier | null
  onSupplierUpdated: (supplier: Supplier) => void
}

export function SupplierForm({ isOpen, onClose, supplier, onSupplierUpdated }: SupplierFormProps) {
  const [formData, setFormData] = useState<Omit<Supplier, "id" | "createdAt" | "updatedAt">>({
    name: supplier?.name || "",
    contactName: supplier?.contactName || "",
    email: supplier?.email || "",
    phone: supplier?.phone || "",
    address: supplier?.address || "",
    businessId: supplier?.businessId || "default",
    paymentTerms: supplier?.paymentTerms || "",
    notes: supplier?.notes || "",
    isActive: supplier?.isActive ?? true,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (supplier) {
        // Update existing supplier
        const updatedSupplier = await updateSupplier(supplier.id, formData)

        if (updatedSupplier) {
          toast({
            title: "Supplier updated",
            description: "The supplier has been updated successfully.",
          })
          onSupplierUpdated(updatedSupplier)
          onClose()
        } else {
          throw new Error("Failed to update supplier")
        }
      } else {
        // Create new supplier
        const newSupplier = await createSupplier(formData)

        if (newSupplier) {
          toast({
            title: "Supplier created",
            description: "The supplier has been created successfully.",
          })
          onSupplierUpdated(newSupplier)
          onClose()
        } else {
          throw new Error("Failed to create supplier")
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error saving the supplier.",
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
            <DialogTitle>{supplier ? "Edit Supplier" : "Add New Supplier"}</DialogTitle>
            <DialogDescription>
              {supplier ? "Update the supplier details below." : "Fill in the details to add a new supplier."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Supplier Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactName">Contact Person</Label>
              <Input id="contactName" name="contactName" value={formData.contactName} onChange={handleChange} />
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
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Input
                id="paymentTerms"
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleChange}
                placeholder="e.g. Net 30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleSwitchChange("isActive", checked)}
              />
              <Label htmlFor="isActive">Active</Label>
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
              ) : supplier ? (
                "Update Supplier"
              ) : (
                "Add Supplier"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

