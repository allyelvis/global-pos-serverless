"use client"

import { useState } from "react"
import { BarChart, Download, Filter, Plus, Search, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

// Sample inventory data
const inventoryItems = [
  {
    id: "1",
    sku: "TS-001",
    name: "T-Shirt",
    category: "Clothing",
    stock: 45,
    lowStockThreshold: 10,
    reorderPoint: 15,
    reorderQuantity: 30,
    lastRestocked: "2023-05-01",
    supplier: "Clothing Supplier Inc.",
  },
  {
    id: "2",
    sku: "JN-001",
    name: "Jeans",
    category: "Clothing",
    stock: 32,
    lowStockThreshold: 5,
    reorderPoint: 10,
    reorderQuantity: 20,
    lastRestocked: "2023-05-05",
    supplier: "Clothing Supplier Inc.",
  },
  {
    id: "3",
    sku: "SN-001",
    name: "Sneakers",
    category: "Footwear",
    stock: 18,
    lowStockThreshold: 5,
    reorderPoint: 8,
    reorderQuantity: 15,
    lastRestocked: "2023-05-10",
    supplier: "Footwear Supplier Inc.",
  },
  {
    id: "4",
    sku: "BP-001",
    name: "Backpack",
    category: "Accessories",
    stock: 24,
    lowStockThreshold: 8,
    reorderPoint: 12,
    reorderQuantity: 20,
    lastRestocked: "2023-05-12",
    supplier: "Accessories Supplier Inc.",
  },
  {
    id: "5",
    sku: "WT-001",
    name: "Watch",
    category: "Accessories",
    stock: 12,
    lowStockThreshold: 3,
    reorderPoint: 5,
    reorderQuantity: 10,
    lastRestocked: "2023-05-15",
    supplier: "Accessories Supplier Inc.",
  },
  {
    id: "6",
    sku: "HP-001",
    name: "Headphones",
    category: "Electronics",
    stock: 15,
    lowStockThreshold: 5,
    reorderPoint: 8,
    reorderQuantity: 15,
    lastRestocked: "2023-05-18",
    supplier: "Electronics Supplier Inc.",
  },
  {
    id: "7",
    sku: "SP-001",
    name: "Smartphone",
    category: "Electronics",
    stock: 8,
    lowStockThreshold: 2,
    reorderPoint: 4,
    reorderQuantity: 8,
    lastRestocked: "2023-05-20",
    supplier: "Electronics Supplier Inc.",
  },
  {
    id: "8",
    sku: "LP-001",
    name: "Laptop",
    category: "Electronics",
    stock: 5,
    lowStockThreshold: 2,
    reorderPoint: 3,
    reorderQuantity: 5,
    lastRestocked: "2023-05-22",
    supplier: "Electronics Supplier Inc.",
  },
]

// Sample categories
const categories = [
  { id: "all", name: "All Categories" },
  { id: "clothing", name: "Clothing" },
  { id: "footwear", name: "Footwear" },
  { id: "accessories", name: "Accessories" },
  { id: "electronics", name: "Electronics" },
]

export function RetailInventoryManager() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [activeTab, setActiveTab] = useState("all")

  const filteredItems = inventoryItems.filter(
    (item) =>
      (selectedCategory === "all" || item.category.toLowerCase() === selectedCategory) &&
      item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const lowStockItems = filteredItems.filter((item) => item.stock <= item.lowStockThreshold)

  const reorderItems = filteredItems.filter(
    (item) => item.stock <= item.reorderPoint && item.stock > item.lowStockThreshold,
  )

  const displayItems = activeTab === "all" ? filteredItems : activeTab === "low-stock" ? lowStockItems : reorderItems

  const getStockStatus = (item: (typeof inventoryItems)[0]) => {
    if (item.stock <= item.lowStockThreshold) {
      return {
        status: "Low Stock",
        color: "bg-destructive",
        textColor: "text-destructive",
      }
    } else if (item.stock <= item.reorderPoint) {
      return {
        status: "Reorder",
        color: "bg-yellow-500",
        textColor: "text-yellow-500",
      }
    } else {
      return {
        status: "In Stock",
        color: "bg-green-500",
        textColor: "text-green-500",
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Retail Inventory Manager</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryItems.length}</div>
            <p className="text-xs text-muted-foreground">{lowStockItems.length} items low in stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((lowStockItems.length / inventoryItems.length) * 100)}% of inventory
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reorder Items</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reorderItems.length}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((reorderItems.length / inventoryItems.length) * 100)}% of inventory
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search inventory..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" className="ml-auto">
          <Filter className="h-4 w-4" />
          <span className="sr-only">Filter</span>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
          <TabsTrigger value="reorder">Reorder</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="border-none p-0">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No items found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayItems.map((item) => {
                      const { status, color, textColor } = getStockStatus(item)
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.sku}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.supplier}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end gap-1">
                              <span>{item.stock}</span>
                              <Progress
                                value={(item.stock / item.reorderQuantity) * 100}
                                className="h-2 w-16"
                                indicatorClassName={color}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={`${textColor} font-medium`}>{status}</span>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

