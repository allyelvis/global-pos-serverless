"use client"

import { useState, useEffect } from "react"
import { Check, CreditCard, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { processPayment } from "@/app/dashboard/pos/actions"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { getCurrentUser } from "@/lib/db/users"
import { getBusinessById } from "@/lib/db/business"
import { Receipt } from "./receipt"

interface CheckoutProps {
  isOpen: boolean
  onClose: () => void
  cart: {
    id: string
    name: string
    price: number
    quantity: number
  }[]
  total: number
  onSuccess: () => void
}

export function Checkout({ isOpen, onClose, cart, total, onSuccess }: CheckoutProps) {
  const [paymentMethod, setPaymentMethod] = useState("credit_card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [businessCurrency, setBusinessCurrency] = useState("USD")
  const [businessInfo, setBusinessInfo] = useState({
    name: "My Business",
    address: "123 Main St, Anytown, USA",
    phone: "(555) 123-4567",
    email: "info@mybusiness.com",
    currency: "USD",
    receiptFooter: "Thank you for your business!",
  })
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchBusinessInfo = async () => {
      try {
        const user = await getCurrentUser()
        if (user) {
          const business = await getBusinessById(user.businessId)
          if (business) {
            setBusinessCurrency(business.currency)
            setBusinessInfo({
              name: business.name,
              address: business.address,
              phone: business.phone,
              email: business.email,
              currency: business.currency,
              receiptFooter: "Thank you for your business!",
            })
          }
        }
      } catch (error) {
        console.error("Failed to fetch business info:", error)
      }
    }

    fetchBusinessInfo()
  }, [])

  const handleCheckout = async () => {
    setIsProcessing(true)

    try {
      const result = await processPayment({
        items: cart,
        total,
        paymentMethod,
        currency: businessCurrency,
      })

      if (result.success) {
        setIsComplete(true)
        toast({
          title: "Payment successful",
          description: `Transaction ID: ${result.transactionId}`,
        })

        // Set order details for receipt
        setOrderDetails({
          orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
          date: new Date().toISOString(),
          items: cart,
          subtotal: total,
          tax: total * 0.1, // Assuming 10% tax
          total: total * 1.1,
          paymentMethod: paymentMethod === "credit_card" ? "Credit Card" : "Cash",
        })

        // Show receipt after 1 second
        setTimeout(() => {
          setIsComplete(false)
          setIsProcessing(false)
          setShowReceipt(true)
        }, 1000)
      } else {
        throw new Error(result.message || "Payment failed")
      }
    } catch (error: any) {
      toast({
        title: "Payment failed",
        description: error.message || "There was an error processing your payment",
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  const handleReceiptPrinted = () => {
    setShowReceipt(false)
    onSuccess()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isProcessing && !showReceipt && onClose()}>
      <DialogContent className="sm:max-w-md">
        {showReceipt ? (
          <Receipt
            order={orderDetails}
            businessInfo={businessInfo}
            onPrint={handleReceiptPrinted}
            onClose={() => {
              setShowReceipt(false)
              onSuccess()
            }}
          />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Checkout</DialogTitle>
              <DialogDescription>Complete your purchase with your preferred payment method.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h3 className="font-medium">Order Summary</h3>
                <div className="rounded-md bg-muted p-3">
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span>
                          {item.name} x {item.quantity}
                        </span>
                        <span>{formatCurrency(item.price * item.quantity, businessCurrency)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>{formatCurrency(total, businessCurrency)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Payment Method</h3>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="credit_card" id="credit_card" />
                    <Label htmlFor="credit_card" className="flex-1">
                      Credit Card
                    </Label>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex-1">
                      Cash
                    </Label>
                    <div className="text-muted-foreground">$</div>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                Cancel
              </Button>
              <Button onClick={handleCheckout} disabled={isProcessing || isComplete}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : isComplete ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Complete
                  </>
                ) : (
                  "Pay Now"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

