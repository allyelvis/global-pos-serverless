import { SalonAppointmentScheduler } from "@/components/sectors/salon/appointment-scheduler"

export default function SalonSectorPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Salon Management</h1>
      <p className="text-muted-foreground">Manage your salon appointments, services, and staff.</p>

      <SalonAppointmentScheduler />
    </div>
  )
}

