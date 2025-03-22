"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Check, CreditCard, Loader2, DollarSign, FileText, Building, Smartphone } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { processPayment } from "@/app/dashboard/pos/actions"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { getCurrentUser } from "@/lib/db/users"
import { getBusinessById } from "@/lib/db/business"
import { Receipt } from "./receipt"
import { type PaymentMethod, PaymentService } from "@/lib/services/payment-service"

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

export function CheckoutEnhanced({ isOpen, onClose, cart, total, onSuccess }: CheckoutProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit_card")
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    checkNumber: "",
    bankAccount: "",
    bankRouting: "",
    paypalEmail: "",
    mobileNumber: "",
    notes: "",
  })
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
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<PaymentMethod[]>([])
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

    // Get available payment methods
    setAvailablePaymentMethods(PaymentService.getAvailablePaymentMethods())

    fetchBusinessInfo()
  }, [])

  const handlePaymentDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPaymentDetails((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validatePaymentDetails = (): boolean => {
    switch (paymentMethod) {
      case "credit_card":
      case "debit_card":
        if (!paymentDetails.cardNumber || !paymentDetails.cardExpiry || !paymentDetails.cardCvc) {
          toast({
            title: "Missing information",
            description: "Please fill in all card details",
            variant: "destructive",
          })
          return false
        }
        break
      case "check":
        if (!paymentDetails.checkNumber) {
          toast({
            title: "Missing information",
            description: "Please enter the check number",
            variant: "destructive",
          })
          return false
        }
        break
      case "bank_transfer":
        if (!paymentDetails.bankAccount || !paymentDetails.bankRouting) {
          toast({
            title: "Missing information",
            description: "Please enter bank account details",
            variant: "destructive",
          })
          return false
        }
        break
      case "paypal":
        if (!paymentDetails.paypalEmail) {
          toast({
            title: "Missing information",
            description: "Please enter PayPal email",
            variant: "destructive",
          })
          return false
        }
        break
      case "mobile_banking":
        if (!paymentDetails.mobileNumber) {
          toast({
            title: "Missing information",
            description: "Please enter mobile number",
            variant: "destructive",
          })
          return false
        }
        break
    }
    return true
  }

  const handleCheckout = async () => {
    if (!validatePaymentDetails()) {
      return
    }

    setIsProcessing(true)

    try {
      const result = await processPayment({
        items: cart,
        total,
        paymentMethod,
        currency: businessCurrency,
        paymentDetails,
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
          paymentMethod: getPaymentMethodDisplayName(paymentMethod),
          transactionId: result.transactionId,
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

  const getPaymentMethodDisplayName = (method: PaymentMethod): string => {
    switch (method) {
      case "credit_card":
        return "Credit Card"
      case "debit_card":
        return "Debit Card"
      case "cash":
        return "Cash"
      case "check":
        return "Check"
      case "bank_transfer":
        return "Bank Transfer"
      case "paypal":
        return "PayPal"
      case "mobile_banking":
        return "Mobile Banking"
      case "cryptocurrency":
        return "Cryptocurrency"
      case "gift_card":
        return "Gift Card"
      case "store_credit":
        return "Store Credit"
      default:
        return method
    }
  }

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case "credit_card":
      case "debit_card":
        return <CreditCard className="h-4 w-4" />
      case "cash":
        return <DollarSign className="h-4 w-4" />
      case "check":
        return <FileText className="h-4 w-4" />
      case "bank_transfer":
        return <Building className="h-4 w-4" />
      case "mobile_banking":
        return <Smartphone className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const renderPaymentDetailsFields = () => {
    switch (paymentMethod) {
      case "credit_card":
      case "debit_card":
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                name="cardNumber"
                placeholder="•••• •••• •••• ••••"
                value={paymentDetails.cardNumber}
                onChange={handlePaymentDetailsChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="cardExpiry">Expiry Date</Label>
                <Input
                  id="cardExpiry"
                  name="cardExpiry"
                  placeholder="MM/YY"
                  value={paymentDetails.cardExpiry}
                  onChange={handlePaymentDetailsChange}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cardCvc">CVC</Label>
                <Input
                  id="cardCvc"
                  name="cardCvc"
                  placeholder="•••"
                  value={paymentDetails.cardCvc}
                  onChange={handlePaymentDetailsChange}
                />
              </div>
            </div>
          </div>
        )
      case "check":
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="checkNumber">Check Number</Label>
              <Input
                id="checkNumber"
                name="checkNumber"
                placeholder="Enter check number"
                value={paymentDetails.checkNumber}
                onChange={handlePaymentDetailsChange}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Additional information"
                value={paymentDetails.notes}
                onChange={handlePaymentDetailsChange}
              />
            </div>
          </div>
        )
      case "bank_transfer":
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="bankAccount">Account Number</Label>
              <Input
                id="bankAccount"
                name="bankAccount"
                placeholder="Enter account number"
                value={paymentDetails.bankAccount}
                onChange={handlePaymentDetailsChange}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="bankRouting">Routing Number</Label>
              <Input
                id="bankRouting"
                name="bankRouting"
                placeholder="Enter routing number"
                value={paymentDetails.bankRouting}
                onChange={handlePaymentDetailsChange}
              />
            </div>
          </div>
        )
      case "paypal":
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="paypalEmail">PayPal Email</Label>
              <Input
                id="paypalEmail"
                name="paypalEmail"
                type="email"
                placeholder="Enter PayPal email"
                value={paymentDetails.paypalEmail}
                onChange={handlePaymentDetailsChange}
              />
            </div>
          </div>
        )
      case "mobile_banking":
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input
                id="mobileNumber"
                name="mobileNumber"
                placeholder="Enter mobile number"
                value={paymentDetails.mobileNumber}
                onChange={handlePaymentDetailsChange}
              />
            </div>
          </div>
        )
      case "cash":
      default:
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Additional information"
                value={paymentDetails.notes}
                onChange={handlePaymentDetailsChange}
              />
            </div>
          </div>
        )
    }
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
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                  className="space-y-2"
                >
                  {availablePaymentMethods.map((method) => (
                    <div key={method} className="flex items-center space-x-2 rounded-md border p-3">
                      <RadioGroupItem value={method} id={method} />
                      <Label htmlFor={method} className="flex-1">
                        {getPaymentMethodDisplayName(method)}
                      </Label>
                      {getPaymentMethodIcon(method)}
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {renderPaymentDetailsFields()}
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

