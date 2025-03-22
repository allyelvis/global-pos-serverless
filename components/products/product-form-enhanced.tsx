"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Loader2, Barcode, QrCode, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createProduct, updateProduct } from "@/lib/db/products"
import { BarcodeService, type BarcodeFormat } from "@/lib/services/barcode-service"
import { useToast } from "@/hooks/use-toast"
import type { Product, Category } from "@/lib/types"

interface ProductFormProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  categories: Category[]
  onProductUpdated: (product: Product) => void
}

export function ProductFormEnhanced({ isOpen, onClose, product, categories, onProductUpdated }: ProductFormProps) {
  const [formData, setFormData] = useState<Omit<Product, "id" | "createdAt" | "updatedAt">>({
    name: "",
    description: "",
    price: 0,
    cost: 0,
    sku: "",
    barcode: "",
    categoryId: "",
    stock: 0,
    lowStockThreshold: 0,
    image: "/placeholder.svg?height=100&width=100",
    isActive: true,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [barcodeFormat, setBarcodeFormat] = useState<BarcodeFormat>("CODE128")
  const [barcodePreview, setBarcodePreview] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price,
        cost: product.cost || 0,
        sku: product.sku,
        barcode: product.barcode || "",
        categoryId: product.categoryId,
        stock: product.stock,
        lowStockThreshold: product.lowStockThreshold || 0,
        image: product.image || "/placeholder.svg?height=100&width=100",
        isActive: product.isActive,
      })

      if (product.barcode) {
        setBarcodePreview(`/api/barcode?data=${encodeURIComponent(product.barcode)}&format=${barcodeFormat}`)
      }
    } else {
      setFormData({
        name: "",
        description: "",
        price: 0,
        cost: 0,
        sku: "",
        barcode: "",
        categoryId: categories.length > 0 ? categories[0].id : "",
        stock: 0,
        lowStockThreshold: 0,
        image: "/placeholder.svg?height=100&width=100",
        isActive: true,
      })
      setBarcodePreview(null)
    }
  }, [product, categories, barcodeFormat])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const generateSKU = () => {
    if (!formData.categoryId) {
      toast({
        title: "Category Required",
        description: "Please select a category first to generate a SKU.",
        variant: "destructive",
      })
      return
    }

    const category = categories.find((c) => c.id === formData.categoryId)
    const categoryCode = category ? category.name.substring(0, 3).toUpperCase() : "GEN"

    const sku = BarcodeService.generateSKU(categoryCode, formData.name || "Product")

    setFormData((prev) => ({
      ...prev,
      sku,
    }))
  }

  const generateBarcode = async () => {
    if (!formData.sku) {
      toast({
        title: "SKU Required",
        description: "Please enter or generate a SKU first.",
        variant: "destructive",
      })
      return
    }

    try {
      // In a real implementation, this would call the BarcodeService
      // For now, we'll just set the barcode to the SKU
      const barcode = formData.sku

      setFormData((prev) => ({
        ...prev,
        barcode,
      }))

      setBarcodePreview(`/api/barcode?data=${encodeURIComponent(barcode)}&format=${barcodeFormat}`)

      toast({
        title: "Barcode Generated",
        description: "Barcode has been generated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate barcode.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (product) {
        // Update existing product
        const updatedProduct = await updateProduct(product.id, formData)

        if (updatedProduct) {
          toast({
            title: "Product updated",
            description: "The product has been updated successfully.",
          })
          onProductUpdated(updatedProduct)
          onClose()
        } else {
          throw new Error("Failed to update product")
        }
      } else {
        // Create new product
        const newProduct = await createProduct(formData)

        if (newProduct) {
          toast({
            title: "Product created",
            description: "The product has been created successfully.",
          })
          onProductUpdated(newProduct)
          onClose()
        } else {
          throw new Error("Failed to create product")
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error saving the product.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription>
              {product ? "Update the product details below." : "Fill in the details to add a new product."}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="barcode">Barcode</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <Select value={formData.categoryId} onValueChange={(value) => handleSelectChange("categoryId", value)}>
                  <SelectTrigger>
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
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleSwitchChange("isActive", checked)}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                  <Input
                    id="lowStockThreshold"
                    name="lowStockThreshold"
                    type="number"
                    min="0"
                    value={formData.lowStockThreshold}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                <div className="flex gap-2">
                  <Input id="sku" name="sku" value={formData.sku} onChange={handleChange} className="flex-1" />
                  <Button type="button" variant="outline" onClick={generateSKU} title="Generate SKU">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Selling Price</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost Price</Label>
                  <Input
                    id="cost"
                    name="cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="rounded-md bg-muted p-3">
                <div className="text-sm font-medium">Profit Margin</div>
                <div className="mt-1 text-lg font-bold">
                  {formData.cost && formData.price
                    ? `${Math.round(((formData.price - formData.cost) / formData.price) * 100)}%`
                    : "N/A"}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Profit: {formData.cost && formData.price ? `$${(formData.price - formData.cost).toFixed(2)}` : "N/A"}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="barcode" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="barcodeFormat">Barcode Format</Label>
                <Select value={barcodeFormat} onValueChange={setBarcodeFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EAN13">EAN-13</SelectItem>
                    <SelectItem value="UPC">UPC</SelectItem>
                    <SelectItem value="CODE128">Code 128</SelectItem>
                    <SelectItem value="QR">QR Code</SelectItem>
                    <SelectItem value="CODE39">Code 39</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode Value</Label>
                <div className="flex gap-2">
                  <Input
                    id="barcode"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleChange}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={generateBarcode} title="Generate Barcode">
                    {barcodeFormat === "QR" ? <QrCode className="h-4 w-4" /> : <Barcode className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {barcodePreview && (
                <div className="mt-4 flex justify-center">
                  <div className="rounded-md border p-4">
                    <img
                      src={barcodePreview || "/placeholder.svg"}
                      alt="Barcode Preview"
                      className="h-auto w-full max-w-[250px]"
                    />
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : product ? (
                "Update Product"
              ) : (
                "Add Product"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

