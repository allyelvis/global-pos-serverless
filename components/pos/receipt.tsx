"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { formatDateTime } from "@/lib/utils"

interface ReceiptProps {
  order: {
    orderNumber: string
    date: string
    items: {
      name: string
      price: number
      quantity: number
    }[]
    subtotal: number
    tax: number
    total: number
    paymentMethod: string
  }
  businessInfo: {
    name: string
    address: string
    phone: string
    email: string
    currency: string
    receiptFooter: string
  }
  onPrint: () => void
  onClose: () => void
}

export function Receipt({ order, businessInfo, onPrint, onClose }: ReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (receiptRef.current) {
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt - ${order.orderNumber}</title>
              <style>
                body {
                  font-family: 'Courier New', monospace;
                  font-size: 12px;
                  width: 300px;
                  margin: 0 auto;
                  padding: 10px;
                }
                .header {
                  text-align: center;
                  margin-bottom: 10px;
                }
                .divider {
                  border-top: 1px dashed #000;
                  margin: 10px 0;
                }
                .item {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 5px;
                }
                .totals {
                  margin-top: 10px;
                }
                .total-line {
                  display: flex;
                  justify-content: space-between;
                }
                .footer {
                  text-align: center;
                  margin-top: 20px;
                  font-size: 10px;
                }
              </style>
            </head>
            <body>
              ${receiptRef.current.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
        onPrint()
      }
    }
  }

  return (
    <div className="space-y-4">
      <div ref={receiptRef} className="bg-white p-4 text-black">
        <div className="header text-center">
          <h2 className="text-lg font-bold">{businessInfo.name}</h2>
          <p className="text-sm">{businessInfo.address}</p>
          <p className="text-sm">{businessInfo.phone}</p>
          <p className="text-sm">{businessInfo.email}</p>
        </div>
        <div className="divider border-t border-dashed border-gray-300 my-4"></div>
        <div className="text-sm">
          <p>Receipt: {order.orderNumber}</p>
          <p>Date: {formatDateTime(order.date)}</p>
          <p>Payment Method: {order.paymentMethod}</p>
        </div>
        <div className="divider border-t border-dashed border-gray-300 my-4"></div>
        <div className="items space-y-2">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <div>
                {item.quantity} x {item.name}
              </div>
              <div>{formatCurrency(item.price * item.quantity, businessInfo.currency)}</div>
            </div>
          ))}
        </div>
        <div className="divider border-t border-dashed border-gray-300 my-4"></div>
        <div className="totals space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(order.subtotal, businessInfo.currency)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>{formatCurrency(order.tax, businessInfo.currency)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span>{formatCurrency(order.total, businessInfo.currency)}</span>
          </div>
        </div>
        <div className="divider border-t border-dashed border-gray-300 my-4"></div>
        <div className="footer text-center text-xs">
          <p>{businessInfo.receiptFooter}</p>
          <p>Thank you for your business!</p>
        </div>
      </div>
      <div className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button onClick={handlePrint}>Print Receipt</Button>
      </div>
    </div>
  )
}

