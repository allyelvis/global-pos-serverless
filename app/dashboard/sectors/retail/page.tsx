import { RetailInventoryManager } from "@/components/sectors/retail/inventory-manager"

export default function RetailSectorPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Retail Management</h1>
      <p className="text-muted-foreground">Manage your retail store inventory, sales, and customers.</p>

      <RetailInventoryManager />
    </div>
  )
}

