import type { Metadata } from "next"
import { ReceiptCustomization } from "@/components/settings/receipt-customization"

export const metadata: Metadata = {
  title: "Receipt Settings | Global POS",
  description: "Customize your receipt templates and settings",
}

export default function ReceiptSettingsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Receipt Settings</h1>
        <p className="text-muted-foreground">Customize how your receipts look and what information they display</p>
      </div>

      <ReceiptCustomization />
    </div>
  )
}

