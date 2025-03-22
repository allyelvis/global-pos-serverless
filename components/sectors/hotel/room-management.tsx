"use client"

import { useState } from "react"
import { Calendar, Edit, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"

// Sample room data
const rooms = [
  {
    id: "101",
    type: "Standard",
    capacity: 2,
    price: 99.99,
    status: "available",
    amenities: ["Wi-Fi", "TV", "Air Conditioning"],
    lastCleaned: "2023-05-15T10:30:00Z",
  },
  {
    id: "102",
    type: "Standard",
    capacity: 2,
    price: 99.99,
    status: "occupied",
    amenities: ["Wi-Fi", "TV", "Air Conditioning"],
    lastCleaned: "2023-05-14T11:15:00Z",
  },
  {
    id: "103",
    type: "Standard",
    capacity: 2,
    price: 99.99,
    status: "maintenance",
    amenities: ["Wi-Fi", "TV", "Air Conditioning"],
    lastCleaned: "2023-05-13T09:45:00Z",
  },
  {
    id: "201",
    type: "Deluxe",
    capacity: 3,
    price: 149.99,
    status: "available",
    amenities: ["Wi-Fi", "TV", "Air Conditioning", "Mini Bar", "Safe"],
    lastCleaned: "2023-05-15T12:00:00Z",
  },
  {
    id: "202",
    type: "Deluxe",
    capacity: 3,
    price: 149.99,
    status: "occupied",
    amenities: ["Wi-Fi", "TV", "Air Conditioning", "Mini Bar", "Safe"],
    lastCleaned: "2023-05-14T13:30:00Z",
  },
  {
    id: "301",
    type: "Suite",
    capacity: 4,
    price: 249.99,
    status: "available",
    amenities: ["Wi-Fi", "TV", "Air Conditioning", "Mini Bar", "Safe", "Jacuzzi", "Kitchen"],
    lastCleaned: "2023-05-15T14:15:00Z",
  },
  {
    id: "302",
    type: "Suite",
    capacity: 4,
    price: 249.99,
    status: "occupied",
    amenities: ["Wi-Fi", "TV", "Air Conditioning", "Mini Bar", "Safe", "Jacuzzi", "Kitchen"],
    lastCleaned: "2023-05-14T15:45:00Z",
  },
  {
    id: "401",
    type: "Presidential Suite",
    capacity: 6,
    price: 499.99,
    status: "available",
    amenities: [
      "Wi-Fi",
      "TV",
      "Air Conditioning",
      "Mini Bar",
      "Safe",
      "Jacuzzi",
      "Kitchen",
      "Private Pool",
      "Butler Service",
    ],
    lastCleaned: "2023-05-15T16:30:00Z",
  },
]

// Sample bookings data
const bookings = [
  {
    id: "B001",
    roomId: "102",
    guestName: "John Smith",
    checkIn: "2023-05-12",
    checkOut: "2023-05-16",
    adults: 2,
    children: 0,
    totalAmount: 399.96,
    status: "active",
  },
  {
    id: "B002",
    roomId: "202",
    guestName: "Alice Johnson",
    checkIn: "2023-05-13",
    checkOut: "2023-05-18",
    adults: 2,
    children: 1,
    totalAmount: 749.95,
    status: "active",
  },
  {
    id: "B003",
    roomId: "302",
    guestName: "Robert Brown",
    checkIn: "2023-05-14",
    checkOut: "2023-05-17",
    adults: 2,
    children: 2,
    totalAmount: 749.97,
    status: "active",
  },
  {
    id: "B004",
    roomId: "103",
    guestName: "Emily Davis",
    checkIn: "2023-05-10",
    checkOut: "2023-05-13",
    adults: 1,
    children: 0,
    totalAmount: 299.97,
    status: "completed",
  },
]

export function HotelRoomManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isRoomFormOpen, setIsRoomFormOpen] = useState(false)
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<(typeof rooms)[0] | null>(null)

  const filteredRooms = rooms.filter(
    (room) =>
      (statusFilter === "all" || room.status === statusFilter) &&
      (typeFilter === "all" || room.type === typeFilter) &&
      room.id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddRoom = () => {
    setSelectedRoom(null)
    setIsRoomFormOpen(true)
  }

  const handleEditRoom = (room: (typeof rooms)[0]) => {
    setSelectedRoom(room)
    setIsRoomFormOpen(true)
  }

  const handleBookRoom = (room: (typeof rooms)[0]) => {
    setSelectedRoom(room)
    setIsBookingFormOpen(true)
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "occupied":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "cleaning":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Hotel Room Management</h2>
        <Button onClick={handleAddRoom}>
          <Plus className="mr-2 h-4 w-4" />
          Add Room
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search rooms..."
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
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="occupied">Occupied</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="cleaning">Cleaning</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Standard">Standard</SelectItem>
            <SelectItem value="Deluxe">Deluxe</SelectItem>
            <SelectItem value="Suite">Suite</SelectItem>
            <SelectItem value="Presidential Suite">Presidential Suite</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>
        <TabsContent value="grid" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredRooms.map((room) => (
              <Card key={room.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Room {room.id}</CardTitle>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                        room.status,
                      )}`}
                    >
                      {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                    </span>
                  </div>
                  <CardDescription>
                    {room.type} - ${room.price}/night
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Capacity:</span>
                      <span>{room.capacity} people</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Cleaned:</span>
                      <span>{formatDate(room.lastCleaned)}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Amenities:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {room.amenities.slice(0, 3).map((amenity) => (
                          <span
                            key={amenity}
                            className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs"
                          >
                            {amenity}
                          </span>
                        ))}
                        {room.amenities.length > 3 && (
                          <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs">
                            +{room.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditRoom(room)}>
                    <Edit className="mr-2 h-3 w-3" />
                    Edit
                  </Button>
                  <Button size="sm" disabled={room.status !== "available"} onClick={() => handleBookRoom(room)}>
                    {room.status === "available" ? "Book Room" : "Unavailable"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="table">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room #</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Price/Night</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Cleaned</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No rooms found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.id}</TableCell>
                      <TableCell>{room.type}</TableCell>
                      <TableCell>{room.capacity}</TableCell>
                      <TableCell>${room.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                            room.status,
                          )}`}
                        >
                          {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(room.lastCleaned)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditRoom(room)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={room.status !== "available"}
                            onClick={() => handleBookRoom(room)}
                          >
                            <Calendar className="h-4 w-4" />
                            <span className="sr-only">Book</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="bookings">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Room #</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.id}</TableCell>
                    <TableCell>{booking.roomId}</TableCell>
                    <TableCell>{booking.guestName}</TableCell>
                    <TableCell>{format(new Date(booking.checkIn), "MMM dd, yyyy")}</TableCell>
                    <TableCell>{format(new Date(booking.checkOut), "MMM dd, yyyy")}</TableCell>
                    <TableCell>
                      {booking.adults} adults, {booking.children} children
                    </TableCell>
                    <TableCell className="text-right">${booking.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          booking.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                        }`}
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isRoomFormOpen} onOpenChange={setIsRoomFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedRoom ? `Edit Room ${selectedRoom.id}` : "Add New Room"}</DialogTitle>
            <DialogDescription>
              {selectedRoom ? "Update the room details below." : "Fill in the details to add a new room."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="roomNumber" className="text-sm font-medium">
                  Room Number
                </label>
                <Input id="roomNumber" defaultValue={selectedRoom?.id || ""} disabled={!!selectedRoom} />
              </div>
              <div className="space-y-2">
                <label htmlFor="roomType" className="text-sm font-medium">
                  Room Type
                </label>
                <Select defaultValue={selectedRoom?.type || "Standard"}>
                  <SelectTrigger id="roomType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Deluxe">Deluxe</SelectItem>
                    <SelectItem value="Suite">Suite</SelectItem>
                    <SelectItem value="Presidential Suite">Presidential Suite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="capacity" className="text-sm font-medium">
                  Capacity
                </label>
                <Input id="capacity" type="number" min="1" defaultValue={selectedRoom?.capacity || "2"} />
              </div>
              <div className="space-y-2">
                <label htmlFor="price" className="text-sm font-medium">
                  Price per Night ($)
                </label>
                <Input id="price" type="number" min="0" step="0.01" defaultValue={selectedRoom?.price || "99.99"} />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <Select defaultValue={selectedRoom?.status || "available"}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amenities</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Wi-Fi",
                  "TV",
                  "Air Conditioning",
                  "Mini Bar",
                  "Safe",
                  "Jacuzzi",
                  "Kitchen",
                  "Private Pool",
                  "Butler Service",
                ].map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`amenity-${amenity}`}
                      defaultChecked={selectedRoom?.amenities.includes(amenity)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label htmlFor={`amenity-${amenity}`} className="text-sm font-medium">
                      {amenity}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoomFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsRoomFormOpen(false)}>{selectedRoom ? "Update Room" : "Add Room"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isBookingFormOpen} onOpenChange={setIsBookingFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Book Room {selectedRoom?.id}</DialogTitle>
            <DialogDescription>Fill in the details to book this room.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="guestName" className="text-sm font-medium">
                Guest Name
              </label>
              <Input id="guestName" placeholder="Enter guest name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="checkIn" className="text-sm font-medium">
                  Check-in Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Pick a date</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <label htmlFor="checkOut" className="text-sm font-medium">
                  Check-out Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Pick a date</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="adults" className="text-sm font-medium">
                  Adults
                </label>
                <Input id="adults" type="number" min="1" defaultValue="2" />
              </div>
              <div className="space-y-2">
                <label htmlFor="children" className="text-sm font-medium">
                  Children
                </label>
                <Input id="children" type="number" min="0" defaultValue="0" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="specialRequests" className="text-sm font-medium">
                Special Requests (Optional)
              </label>
              <textarea
                id="specialRequests"
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                rows={3}
              ></textarea>
            </div>
            <div className="rounded-md bg-muted p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Room Rate:</span>
                <span>${selectedRoom?.price.toFixed(2)}/night</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-medium">Total (3 nights):</span>
                <span className="font-bold">${selectedRoom ? (selectedRoom.price * 3).toFixed(2) : "0.00"}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsBookingFormOpen(false)}>Confirm Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

