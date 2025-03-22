"use client"

import { useState } from "react"
import { CalendarIcon, Clock, Plus, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

// Sample staff data
const staff = [
  { id: "1", name: "John Smith", role: "Hair Stylist" },
  { id: "2", name: "Emily Johnson", role: "Colorist" },
  { id: "3", name: "Michael Brown", role: "Barber" },
  { id: "4", name: "Sarah Davis", role: "Nail Technician" },
  { id: "5", name: "David Wilson", role: "Massage Therapist" },
]

// Sample services data
const services = [
  { id: "1", name: "Haircut", duration: 30, price: 35 },
  { id: "2", name: "Hair Coloring", duration: 90, price: 120 },
  { id: "3", name: "Manicure", duration: 45, price: 40 },
  { id: "4", name: "Pedicure", duration: 60, price: 50 },
  { id: "5", name: "Facial", duration: 60, price: 80 },
  { id: "6", name: "Massage", duration: 60, price: 90 },
  { id: "7", name: "Waxing", duration: 30, price: 35 },
  { id: "8", name: "Beard Trim", duration: 15, price: 20 },
]

// Sample appointments data
const initialAppointments = [
  {
    id: "1",
    customerId: "1",
    customerName: "Alice Smith",
    customerPhone: "555-123-4567",
    staffId: "1",
    serviceId: "1",
    date: new Date(2023, 4, 15, 10, 0),
    duration: 30,
    status: "completed",
    notes: "",
  },
  {
    id: "2",
    customerId: "2",
    customerName: "Bob Johnson",
    customerPhone: "555-234-5678",
    staffId: "2",
    serviceId: "2",
    date: new Date(2023, 4, 15, 13, 0),
    duration: 90,
    status: "completed",
    notes: "Highlights and lowlights",
  },
  {
    id: "3",
    customerId: "3",
    customerName: "Carol Williams",
    customerPhone: "555-345-6789",
    staffId: "4",
    serviceId: "3",
    date: new Date(2023, 4, 15, 15, 0),
    duration: 45,
    status: "completed",
    notes: "",
  },
  {
    id: "4",
    customerId: "4",
    customerName: "David Brown",
    customerPhone: "555-456-7890",
    staffId: "3",
    serviceId: "8",
    date: new Date(2023, 4, 16, 11, 0),
    duration: 15,
    status: "confirmed",
    notes: "",
  },
  {
    id: "5",
    customerId: "5",
    customerName: "Eva Davis",
    customerPhone: "555-567-8901",
    staffId: "5",
    serviceId: "6",
    date: new Date(2023, 4, 16, 14, 0),
    duration: 60,
    status: "confirmed",
    notes: "Deep tissue massage",
  },
  {
    id: "6",
    customerId: "6",
    customerName: "Frank Miller",
    customerPhone: "555-678-9012",
    staffId: "1",
    serviceId: "1",
    date: new Date(2023, 4, 17, 9, 0),
    duration: 30,
    status: "confirmed",
    notes: "",
  },
  {
    id: "7",
    customerId: "7",
    customerName: "Grace Wilson",
    customerPhone: "555-789-0123",
    staffId: "4",
    serviceId: "4",
    date: new Date(2023, 4, 17, 13, 0),
    duration: 60,
    status: "confirmed",
    notes: "",
  },
]

// Set today's date for the calendar
const today = new Date()
today.setHours(0, 0, 0, 0)

export function SalonAppointmentScheduler() {
  const [date, setDate] = useState<Date>(today)
  const [appointments, setAppointments] = useState(initialAppointments)
  const [isNewAppointmentDialogOpen, setIsNewAppointmentDialogOpen] = useState(false)
  const [newAppointment, setNewAppointment] = useState({
    customerName: "",
    customerPhone: "",
    staffId: "",
    serviceId: "",
    date: today,
    time: "09:00",
    notes: "",
  })

  const filteredAppointments = appointments.filter(
    (appointment) =>
      appointment.date.getDate() === date.getDate() &&
      appointment.date.getMonth() === date.getMonth() &&
      appointment.date.getFullYear() === date.getFullYear(),
  )

  const handleNewAppointmentChange = (field: string, value: string | Date) => {
    setNewAppointment((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddAppointment = () => {
    const [hours, minutes] = newAppointment.time.split(":").map(Number)
    const appointmentDate = new Date(newAppointment.date)
    appointmentDate.setHours(hours, minutes, 0, 0)

    const service = services.find((s) => s.id === newAppointment.serviceId)
    const duration = service ? service.duration : 30

    const newAppointmentObj = {
      id: `${Date.now()}`,
      customerId: `${Date.now()}`,
      customerName: newAppointment.customerName,
      customerPhone: newAppointment.customerPhone,
      staffId: newAppointment.staffId,
      serviceId: newAppointment.serviceId,
      date: appointmentDate,
      duration,
      status: "confirmed",
      notes: newAppointment.notes,
    }

    setAppointments([...appointments, newAppointmentObj])
    setIsNewAppointmentDialogOpen(false)
    setNewAppointment({
      customerName: "",
      customerPhone: "",
      staffId: "",
      serviceId: "",
      date: today,
      time: "09:00",
      notes: "",
    })
  }

  const getAppointmentCardColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/50"
      case "confirmed":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50"
      case "cancelled":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50"
      default:
        return ""
    }
  }

  const timeSlots = Array.from({ length: 12 }, (_, i) => i + 9).map((hour) => {
    return `${hour.toString().padStart(2, "0")}:00`
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Salon Appointment Scheduler</h2>
        <Dialog open={isNewAppointmentDialogOpen} onOpenChange={setIsNewAppointmentDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Appointment</DialogTitle>
              <DialogDescription>Fill in the details to schedule a new appointment.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={newAppointment.customerName}
                    onChange={(e) => handleNewAppointmentChange("customerName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone Number</Label>
                  <Input
                    id="customerPhone"
                    value={newAppointment.customerPhone}
                    onChange={(e) => handleNewAppointmentChange("customerPhone", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="staff">Staff Member</Label>
                  <Select
                    value={newAppointment.staffId}
                    onValueChange={(value) => handleNewAppointmentChange("staffId", value)}
                  >
                    <SelectTrigger id="staff">
                      <SelectValue placeholder="Select staff" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.name} ({person.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service">Service</Label>
                  <Select
                    value={newAppointment.serviceId}
                    onValueChange={(value) => handleNewAppointmentChange("serviceId", value)}
                  >
                    <SelectTrigger id="service">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} (${service.price})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newAppointment.date ? format(newAppointment.date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newAppointment.date}
                        onSelect={(date) => handleNewAppointmentChange("date", date || today)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Select
                    value={newAppointment.time}
                    onValueChange={(value) => handleNewAppointmentChange("time", value)}
                  >
                    <SelectTrigger id="time">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={newAppointment.notes}
                  onChange={(e) => handleNewAppointmentChange("notes", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={handleAddAppointment}
                disabled={!newAppointment.customerName || !newAppointment.staffId || !newAppointment.serviceId}
              >
                Schedule Appointment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Select a date to view appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => setDate(newDate || today)}
              className="rounded-md border"
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                const yesterday = new Date(date)
                yesterday.setDate(date.getDate() - 1)
                setDate(yesterday)
              }}
            >
              Previous Day
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const tomorrow = new Date(date)
                tomorrow.setDate(date.getDate() + 1)
                setDate(tomorrow)
              }}
            >
              Next Day
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appointments for {format(date, "EEEE, MMMM d, yyyy")}</CardTitle>
            <CardDescription>{filteredAppointments.length} appointments scheduled</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAppointments.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center rounded-md border border-dashed">
                  <p className="text-sm text-muted-foreground">No appointments scheduled for this day</p>
                  <Button variant="link" onClick={() => setIsNewAppointmentDialogOpen(true)}>
                    Add an appointment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {timeSlots.map((timeSlot) => {
                    const slotAppointments = filteredAppointments.filter((appointment) => {
                      const hours = appointment.date.getHours()
                      return `${hours.toString().padStart(2, "0")}:00` === timeSlot
                    })

                    if (slotAppointments.length === 0) return null

                    return (
                      <div key={timeSlot} className="space-y-2">
                        <h3 className="font-medium">{timeSlot}</h3>
                        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                          {slotAppointments.map((appointment) => {
                            const staffMember = staff.find((s) => s.id === appointment.staffId)
                            const service = services.find((s) => s.id === appointment.serviceId)

                            return (
                              <Card
                                key={appointment.id}
                                className={cn("border-l-4", getAppointmentCardColor(appointment.status))}
                              >
                                <CardHeader className="p-4 pb-2">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">{service?.name}</CardTitle>
                                    <span className="text-sm text-muted-foreground">{appointment.duration} min</span>
                                  </div>
                                  <CardDescription>
                                    {format(appointment.date, "h:mm a")} -{" "}
                                    {format(
                                      new Date(appointment.date.getTime() + appointment.duration * 60000),
                                      "h:mm a",
                                    )}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                  <div className="flex items-center gap-2 text-sm">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span>{appointment.customerName}</span>
                                  </div>
                                  <div className="mt-1 flex items-center gap-2 text-sm">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>With {staffMember?.name}</span>
                                  </div>
                                  {appointment.notes && (
                                    <p className="mt-2 text-xs text-muted-foreground">Note: {appointment.notes}</p>
                                  )}
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

