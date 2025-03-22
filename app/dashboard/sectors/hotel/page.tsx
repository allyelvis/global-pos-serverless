import { HotelRoomManagement } from "@/components/sectors/hotel/room-management"

export default function HotelSectorPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Hotel Management</h1>
      <p className="text-muted-foreground">Manage your hotel rooms, bookings, and guests.</p>

      <HotelRoomManagement />
    </div>
  )
}

