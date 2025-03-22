"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { currencies } from "@/lib/currency"

// Mock data
const mockLocations = [
  {
    id: "loc-1",
    name: "Main Store",
    address: "123 Main St, Anytown, USA",
    phone: "(555) 123-4567",
    email: "main@example.com",
    businessId: "business-1",
    isMainLocation: true,
    settings: {
      taxRate: 8.5,
      currency: "USD",
      timeZone: "America/New_York",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "loc-2",
    name: "Downtown Branch",
    address: "456 Market St, Anytown, USA",
    phone: "(555) 987-6543",
    email: "downtown@example.com",
    businessId: "business-1",
    isMainLocation: false,
    settings: {
      taxRate: 9.0,
      currency: "USD",
      timeZone: "America/New_York",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const locationFormSchema = z.object({
  name: z.string().min(2, {
    message: "Location name must be at least 2 characters.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  isMainLocation: z.boolean().default(false),
  taxRate: z.coerce.number().min(0).max(100).optional(),
  currency: z.string().optional(),
  timeZone: z.string().optional(),
})

type LocationFormValues = z.infer<typeof locationFormSchema>

export function LocationManagement() {
  const [locations, setLocations] = useState(mockLocations)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
      isMainLocation: false,
      taxRate: 0,
      currency: "USD",
      timeZone: "America/New_York",
    },
  })

  useEffect(() => {
    if (editingLocation) {
      form.reset({
        name: editingLocation.name,
        address: editingLocation.address,
        phone: editingLocation.phone || "",
        email: editingLocation.email || "",
        isMainLocation: editingLocation.isMainLocation,
        taxRate: editingLocation.settings?.taxRate,
        currency: editingLocation.settings?.currency,
        timeZone: editingLocation.settings?.timeZone,
      })
    } else {
      form.reset({
        name: "",
        address: "",
        phone: "",
        email: "",
        isMainLocation: false,
        taxRate: 0,
        currency: "USD",
        timeZone: "America/New_York",
      })
    }
  }, [editingLocation, form])

  const onSubmit = async (data: LocationFormValues) => {
    setIsLoading(true)
    try {
      // In a real app, you would call an API to save the location
      if (editingLocation) {
        // Update existing location
        const updatedLocations = locations.map((loc) =>
          loc.id === editingLocation.id
            ? {
                ...loc,
                name: data.name,
                address: data.address,
                phone: data.phone,
                email: data.email,
                isMainLocation: data.isMainLocation,
                settings: {
                  taxRate: data.taxRate,
                  currency: data.currency,
                  timeZone: data.timeZone,
                },
                updatedAt: new Date(),
              }
            : loc,
        )
        setLocations(updatedLocations)
        toast({
          title: "Location updated",
          description: "The location has been updated successfully.",
        })
      } else {
        // Create new location
        const newLocation = {
          id: `loc-${Date.now()}`,
          name: data.name,
          address: data.address,
          phone: data.phone,
          email: data.email,
          businessId: "business-1", // In a real app, this would be the actual business ID
          isMainLocation: data.isMainLocation,
          settings: {
            taxRate: data.taxRate,
            currency: data.currency,
            timeZone: data.timeZone,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        setLocations([...locations, newLocation])
        toast({
          title: "Location created",
          description: "The new location has been created successfully.",
        })
      }
      setIsDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save location. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (location: any) => {
    setEditingLocation(location)
    setIsDialogOpen(true)
  }

  const handleDelete = (locationId: string) => {
    // In a real app, you would call an API to delete the location
    setLocations(locations.filter((loc) => loc.id !== locationId))
    toast({
      title: "Location deleted",
      description: "The location has been deleted successfully.",
    })
  }

  const handleAddNew = () => {
    setEditingLocation(null)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Location Management</h2>
          <p className="text-muted-foreground">Manage your business locations and settings.</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add Location
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => (
          <Card key={location.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{location.name}</CardTitle>
                {location.isMainLocation && (
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    Main Location
                  </span>
                )}
              </div>
              <CardDescription>{location.address}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2 text-sm">
                {location.phone && (
                  <div className="flex items-center">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="ml-2">{location.phone}</span>
                  </div>
                )}
                {location.email && (
                  <div className="flex items-center">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="ml-2">{location.email}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <span className="text-muted-foreground">Tax Rate:</span>
                  <span className="ml-2">{location.settings?.taxRate}%</span>
                </div>
                <div className="flex items-center">
                  <span className="text-muted-foreground">Currency:</span>
                  <span className="ml-2">{location.settings?.currency}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <Button variant="outline" size="sm" onClick={() => handleEdit(location)}>
                <Edit className="mr-2 h-3 w-3" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive"
                onClick={() => handleDelete(location.id)}
                disabled={location.isMainLocation}
              >
                <Trash2 className="mr-2 h-3 w-3" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingLocation ? "Edit Location" : "Add New Location"}</DialogTitle>
            <DialogDescription>
              {editingLocation
                ? "Update the details for this location."
                : "Enter the details for your new business location."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter location name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isMainLocation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Main Location</FormLabel>
                        <FormDescription>Set as the primary business location</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={editingLocation?.isMainLocation}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter location address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email address" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="taxRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Rate (%)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter tax rate" type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(currencies).map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.code} - {currency.symbol}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timeZone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Zone</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time zone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                          <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                          <SelectItem value="Europe/London">London (GMT)</SelectItem>
                          <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                          <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                          <SelectItem value="Asia/Shanghai">Shanghai (CST)</SelectItem>
                          <SelectItem value="Australia/Sydney">Sydney (AEST)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : editingLocation ? "Update Location" : "Add Location"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

