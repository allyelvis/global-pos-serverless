import { RestaurantMenuBuilder } from "@/components/sectors/restaurant/menu-builder"

export default function RestaurantSectorPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Restaurant Management</h1>
      <p className="text-muted-foreground">Manage your restaurant menu, orders, and tables.</p>

      <RestaurantMenuBuilder />
    </div>
  )
}

