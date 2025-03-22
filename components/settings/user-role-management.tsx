"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, Shield, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

// Mock data
const mockUsers = [
  {
    id: "user-1",
    name: "John Doe",
    email: "john@example.com",
    role: "admin",
    businessId: "business-1",
    locationId: "loc-1",
    lastLoginAt: new Date(),
    createdAt: new Date(),
  },
  {
    id: "user-2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "manager",
    businessId: "business-1",
    locationId: "loc-1",
    lastLoginAt: new Date(),
    createdAt: new Date(),
  },
  {
    id: "user-3",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "cashier",
    businessId: "business-1",
    locationId: "loc-2",
    lastLoginAt: new Date(),
    createdAt: new Date(),
  },
  {
    id: "user-4",
    name: "Alice Brown",
    email: "alice@example.com",
    role: "kitchen",
    businessId: "business-1",
    locationId: "loc-1",
    lastLoginAt: new Date(),
    createdAt: new Date(),
  },
]

const mockLocations = [
  { id: "loc-1", name: "Main Store" },
  { id: "loc-2", name: "Downtown Branch" },
]

const mockPermissions = {
  admin: [
    "dashboard.view",
    "pos.access",
    "products.manage",
    "orders.manage",
    "customers.manage",
    "reports.view",
    "settings.manage",
    "users.manage",
  ],
  manager: ["dashboard.view", "pos.access", "products.manage", "orders.manage", "customers.manage", "reports.view"],
  cashier: ["pos.access", "orders.view"],
  kitchen: ["orders.view", "orders.update"],
  waiter: ["pos.access", "orders.create", "orders.view"],
  staff: ["pos.access", "orders.view", "customers.view"],
}

const userFormSchema = z
  .object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    role: z.string({
      required_error: "Please select a role.",
    }),
    locationId: z.string({
      required_error: "Please select a location.",
    }),
    password: z
      .string()
      .min(8, {
        message: "Password must be at least 8 characters.",
      })
      .optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.password && data.confirmPassword) {
        return data.password === data.confirmPassword
      }
      return true
    },
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    },
  )

type UserFormValues = z.infer<typeof userFormSchema>

export function UserRoleManagement() {
  const [users, setUsers] = useState(mockUsers)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [viewingPermissions, setViewingPermissions] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "staff",
      locationId: "",
      password: "",
      confirmPassword: "",
    },
  })

  const handleAddNew = () => {
    setEditingUser(null)
    form.reset({
      name: "",
      email: "",
      role: "staff",
      locationId: "",
      password: "",
      confirmPassword: "",
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (user: any) => {
    setEditingUser(user)
    form.reset({
      name: user.name,
      email: user.email,
      role: user.role,
      locationId: user.locationId,
      password: "",
      confirmPassword: "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (userId: string) => {
    // In a real app, you would call an API to delete the user
    setUsers(users.filter((user) => user.id !== userId))
    toast({
      title: "User deleted",
      description: "The user has been deleted successfully.",
    })
  }

  const handleViewPermissions = (role: string) => {
    setViewingPermissions(role)
    setIsPermissionsDialogOpen(true)
  }

  const onSubmit = async (data: UserFormValues) => {
    setIsLoading(true)
    try {
      // In a real app, you would call an API to save the user
      if (editingUser) {
        // Update existing user
        const updatedUsers = users.map((user) =>
          user.id === editingUser.id
            ? {
                ...user,
                name: data.name,
                email: data.email,
                role: data.role,
                locationId: data.locationId,
              }
            : user,
        )
        setUsers(updatedUsers)
        toast({
          title: "User updated",
          description: "The user has been updated successfully.",
        })
      } else {
        // Create new user
        const newUser = {
          id: `user-${Date.now()}`,
          name: data.name,
          email: data.email,
          role: data.role,
          businessId: "business-1", // In a real app, this would be the actual business ID
          locationId: data.locationId,
          lastLoginAt: null,
          createdAt: new Date(),
        }
        setUsers([...users, newUser])
        toast({
          title: "User created",
          description: "The new user has been created successfully.",
        })
      }
      setIsDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "manager":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "cashier":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "kitchen":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "waiter":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "Never"
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date)
  }

  const getLocationName = (locationId: string) => {
    const location = mockLocations.find((loc) => loc.id === locationId)
    return location ? location.name : "Unknown"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage users and their roles in your business.</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage user accounts and permissions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeClass(
                        user.role,
                      )}`}
                    >
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>{getLocationName(user.locationId)}</TableCell>
                  <TableCell>{formatDate(user.lastLoginAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewPermissions(user.role)}
                        title="View Permissions"
                      >
                        <Shield className="h-4 w-4" />
                        <span className="sr-only">View Permissions</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(user)} title="Edit User">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDelete(user.id)}
                        title="Delete User"
                        disabled={user.role === "admin"}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Update the user details and role." : "Enter the details for the new user."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter user name" {...field} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email address" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="cashier">Cashier</SelectItem>
                          <SelectItem value="kitchen">Kitchen Staff</SelectItem>
                          <SelectItem value="waiter">Waiter</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>This determines what permissions the user will have.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="locationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockLocations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {!editingUser && (
                <>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter password" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input placeholder="Confirm password" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : editingUser ? "Update User" : "Add User"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {viewingPermissions
                ? `${viewingPermissions.charAt(0).toUpperCase() + viewingPermissions.slice(1)} Permissions`
                : "Permissions"}
            </DialogTitle>
            <DialogDescription>These are the permissions assigned to this role.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Permission</TableHead>
                  <TableHead className="text-right">Access</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  "dashboard.view",
                  "pos.access",
                  "products.manage",
                  "orders.manage",
                  "customers.manage",
                  "reports.view",
                  "settings.manage",
                  "users.manage",
                ].map((permission) => {
                  const hasPermission = viewingPermissions
                    ? mockPermissions[viewingPermissions as keyof typeof mockPermissions]?.includes(permission)
                    : false
                  return (
                    <TableRow key={permission}>
                      <TableCell className="font-medium">{permission}</TableCell>
                      <TableCell className="text-right">
                        {hasPermission ? (
                          <Check className="ml-auto h-4 w-4 text-green-500" />
                        ) : (
                          <X className="ml-auto h-4 w-4 text-red-500" />
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsPermissionsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

