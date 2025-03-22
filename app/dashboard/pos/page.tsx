"use client"

import { useEffect, useState } from "react"
import { Minus, Plus, Search, ShoppingCart, Trash2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkout } from "@/components/pos/checkout"
import { getAllProducts } from "@/lib/db/products"
import { getAllCategories } from "@/lib/db/categories"
import { getBusinessById } from "@/lib/db/business"
import { getCurrentUser } from "@/lib/db/users"
import type { Product, Category } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { initializeDatabase } from "@/lib/db/init"

// Fallback data in case of database errors
const fallbackProducts: Product[] = [
  {
    id: "fallback-1",
    name: "Sample Product 1",
    description: "A sample product",
    price: 19.99,
    sku: "SAMPLE-1",
    categoryId: "fallback-category",
    stock: 10,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fallback-2",
    name: "Sample Product 2",
    description: "Another sample product",
    price: 29.99,
    sku: "SAMPLE-2",
    categoryId: "fallback-category",
    stock: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const fallbackCategories: Category[] = [
  {
    id: "fallback-category",
    name: "Sample Category",
    description: "A sample category",
    businessId: "default",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [businessCurrency, setBusinessCurrency] = useState("USD")
  const [dataError, setDataError] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Initialize database if needed
        await initializeDatabase()

        // Fetch products and categories
        const productsData = await getAllProducts()
        const categoriesData = await getAllCategories()

        // Get business currency
        const user = await getCurrentUser()
        if (user) {
          const business = await getBusinessById(user.businessId)
          if (business) {
            setBusinessCurrency(business.currency)
          }
        }

        // Use fetched data or fallback to sample data if empty
        setProducts(productsData.length > 0 ? productsData : fallbackProducts)
        setCategories(categoriesData.length > 0 ? categoriesData : fallbackCategories)

        if (productsData.length === 0 || categoriesData.length === 0) {
          setDataError(true)
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
        // Use fallback data in case of error
        setProducts(fallbackProducts)
        setCategories(fallbackCategories)
        setDataError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredProducts = products.filter(
    (product) =>
      (activeCategory === "all" || product.categoryId === activeCategory) &&
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      product.isActive,
  )

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)
      if (existingItem) {
        return prevCart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      } else {
        return [
          ...prevCart,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image || "/placeholder.svg?height=100&width=100",
          },
        ]
      }
    })
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setCart((prevCart) => prevCart.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handleCheckoutSuccess = () => {
    setCart([])
    setIsCheckoutOpen(false)
  }

  return (
    <div className="flex h-full flex-col">
      {dataError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            There was an issue loading data. Using sample data instead. Some features may be limited.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button className="relative">
              <ShoppingCart className="mr-2 h-4 w-4" />
              <span>Cart</span>
              {cart.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="flex w-full flex-col sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Shopping Cart</SheetTitle>
            </SheetHeader>
            <ScrollArea className="flex-1">
              {cart.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center text-center">
                  <ShoppingCart className="mb-2 h-10 w-10 text-muted-foreground" />
                  <p className="text-lg font-medium">Your cart is empty</p>
                  <p className="text-sm text-muted-foreground">Add items to your cart to see them here</p>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <img
                        src={item.image || "/placeholder.svg?height=64&width=64"}
                        alt={item.name}
                        className="h-16 w-16 rounded-md object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{formatCurrency(item.price, businessCurrency)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <Separator className="my-4" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total</span>
                <span className="font-bold">{formatCurrency(calculateTotal(), businessCurrency)}</span>
              </div>
              <SheetFooter>
                <Button className="w-full" disabled={cart.length === 0} onClick={() => setIsCheckoutOpen(true)}>
                  Checkout
                </Button>
              </SheetFooter>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory} className="flex-1">
        <TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start gap-2">
          <TabsTrigger key="all" value="all" className="rounded-md px-3 py-1.5">
            All Products
          </TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="rounded-md px-3 py-1.5">
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={activeCategory} className="flex-1 pt-0">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <p>Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-center">
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm text-muted-foreground">Try changing your search or category filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <CardHeader className="p-0">
                    <img
                      src={product.image || "/placeholder.svg?height=160&width=320"}
                      alt={product.name}
                      className="h-40 w-full object-cover"
                    />
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <p className="text-muted-foreground">{formatCurrency(product.price, businessCurrency)}</p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button className="w-full" onClick={() => addToCart(product)}>
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Checkout
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        total={calculateTotal()}
        onSuccess={handleCheckoutSuccess}
      />
    </div>
  )
}

