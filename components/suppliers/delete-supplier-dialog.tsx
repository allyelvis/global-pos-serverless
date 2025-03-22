"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteSupplier } from "@/lib/db/suppliers"
import { useToast } from "@/hooks/use-toast"
import type { Supplier } from "@/lib/types"

interface DeleteSupplierDialogProps {
  isOpen: boolean
  onClose: () => void
  supplier: Supplier | null
  onSupplierDeleted: (supplierId: string) => void
}

export function DeleteSupplierDialog({ isOpen, onClose, supplier, onSupplierDeleted }: DeleteSupplierDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!supplier) return

    setIsDeleting(true)

    try {
      const success = await deleteSupplier(supplier.id)

      if (success) {
        toast({
          title: "Supplier deleted",
          description: "The supplier has been deleted successfully.",
        })
        onSupplierDeleted(supplier.id)
        onClose()
      } else {
        throw new Error("Failed to delete supplier")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error deleting the supplier.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the supplier <strong>{supplier?.name}</strong>. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

