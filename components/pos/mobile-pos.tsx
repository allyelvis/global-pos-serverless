"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, Printer, ArrowLeft } from "lucide-react"
import { formatCurrency } from "@/lib/currency"

// Mock data - in a real app this would come from your API
const mockCategories = [
  { id: "cat1", name: "Food" },
  { id: "cat2", name: "Drinks" },
  { id: "cat3", name: "Desserts" },
  { id: "cat4", name: "Specials" },
]

const mockProducts = [
  { id: "p1", name: "Burger", price: 9.99, categoryId: "cat1", image: "/placeholder.svg?height=80&width=80" },
  { id: "p2", name: "Pizza", price: 12.99, categoryId: "cat1", image: "/placeholder.svg?height=80&width=80" },
  { id: "p3", name: "Salad", price: 7.99, categoryId: "cat1", image: "/placeholder.svg?height=80&width=80" },
  { id: "p4", name: "Soda", price: 2.99, categoryId: "cat2", image: "/placeholder.svg?height=80&width=80" },
  { id: "p5", name: "Coffee", price: 3.99, categoryId: "cat2", image: "/placeholder.svg?height=80&width=80" },
  { id: "p6", name: "Tea", price: 2.49, categoryId: "cat2", image: "/placeholder.svg?height=80&width=80" },
  { id: "p7", name: "Cake", price: 5.99, categoryId: "cat3", image: "/placeholder.svg?height=80&width=80" },
  { id: "p8", name: "Ice Cream", price: 4.99, categoryId: "cat3", image: "/placeholder.svg?height=80&width=80" },
  { id: "p9", name: "Daily Special", price: 14.99, categoryId: "cat4", image: "/placeholder.svg?height=80&width=80" },
]

type CartItem = {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
}

export function MobilePOS() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [view, setView] = useState<"products" | "cart">("products")

  // Filter products based on category and search query
  const filteredProducts = mockProducts.filter((product) => {
    const matchesCategory = activeCategory === "all" || product.categoryId === activeCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Calculate cart totals
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.08 // 8% tax rate
  const total = subtotal + tax

  // Add product to cart
  const addToCart = (product: any) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.productId === product.id)

      if (existingItem) {
        return prevCart.map((item) => (item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      } else {
        return [
          ...prevCart,
          {
            id: `cart-${Date.now()}`,
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
          },
        ]
      }
    })
  }

  // Update cart item quantity
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId)
      return
    }

    setCart((prevCart) => prevCart.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)))
  }

  // Remove item from cart
  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId))
  }

  // Clear cart
  const clearCart = () => {
    if (confirm("Are you sure you want to clear the cart?")) {
      setCart([])
    }
  }

  // Process payment (mock)
  const processPayment = () => {
    alert(`Payment processed for $${total.toFixed(2)}`)
    setCart([])
  }

  // Print receipt (mock)
  const printReceipt = () => {
    alert("Receipt printed")
  }

  // Detect if we're on a small screen
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="text-primary-foreground"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Mobile POS</h1>
        <Button
          variant="ghost"
          size="icon"
          className="text-primary-foreground relative"
          onClick={() => setView(view === "products" ? "cart" : "products")}
        >
          <ShoppingCart className="h-5 w-5" />
          {cart.length > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </Badge>
          )}
        </Button>
      </div>

      {/* Main content */}
      {view === "products" ? (
        <div className="flex-1 flex flex-col">
          {/* Search */}
          <div className="p-4 bg-muted/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Categories */}
          <ScrollArea className="border-b">
            <div className="flex p-2 space-x-2">
              <Button
                variant={activeCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory("all")}
                className="whitespace-nowrap"
              >
                All
              </Button>
              {mockCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category.id)}
                  className="whitespace-nowrap"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </ScrollArea>

          {/* Products */}
          <ScrollArea className="flex-1">
            <div className="grid grid-cols-2 gap-4 p-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-24 object-cover"
                  />
                  <CardContent className="p-3">
                    <div className="font-medium truncate">{product.name}</div>
                    <div className="text-sm text-muted-foreground">{formatCurrency(product.price)}</div>
                    <Button size="sm" className="w-full mt-2" onClick={() => addToCart(product)}>
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {filteredProducts.length === 0 && (
                <div className="col-span-2 text-center py-8 text-muted-foreground">No products found</div>
              )}
            </div>
          </ScrollArea>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Cart items */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">Cart Items</h2>
                {cart.length > 0 && (
                  <Button variant="outline" size="sm" onClick={clearCart}>
                    Clear Cart
                  </Button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Your cart is empty</div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-4">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(item.price)} × {item.quantity}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
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
            </div>
          </ScrollArea>

          {/* Cart totals */}
          <div className="border-t p-4 bg-card">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (8%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <Button variant="outline" className="w-full" disabled={cart.length === 0} onClick={printReceipt}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button className="w-full" disabled={cart.length === 0} onClick={processPayment}>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

