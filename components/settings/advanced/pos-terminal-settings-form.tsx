"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface POSTerminalSettings {
  receiptPrinter: {
    enabled: boolean
    printerName: string
    paperSize: string
    autoPrint: boolean
  }
  customerDisplay: {
    enabled: boolean
    displayType: string
  }
  barcodeScanner: {
    enabled: boolean
    scannerType: string
  }
  cashDrawer: {
    enabled: boolean
    openAutomatically: boolean
  }
  touchscreen: {
    enabled: boolean
    calibration: string
  }
  paymentTerminals: {
    enabled: boolean
    terminalType: string
    connectionType: string
  }
  offlineMode: {
    enabled: boolean
    syncInterval: number
  }
}

interface POSTerminalSettingsFormProps {
  settings: POSTerminalSettings
  onSave: (settings: POSTerminalSettings) => void
  isSaving: boolean
}

export default function POSTerminalSettingsForm({ settings, onSave, isSaving }: POSTerminalSettingsFormProps) {
  const [formState, setFormState] = useState<POSTerminalSettings>(settings)

  const handleNestedChange = (section: string, field: string, value: any) => {
    setFormState((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof POSTerminalSettings],
        [field]: value,
      },
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formState)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Accordion type="single" collapsible defaultValue="receipt-printer">
        <AccordionItem value="receipt-printer">
          <AccordionTrigger>Receipt Printer</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="receipt-printer-enabled"
                  checked={formState.receiptPrinter.enabled}
                  onCheckedChange={(checked) => handleNestedChange("receiptPrinter", "enabled", checked)}
                />
                <Label htmlFor="receipt-printer-enabled">Enable Receipt Printer</Label>
              </div>

              {formState.receiptPrinter.enabled && (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="printer-name">Printer Name</Label>
                      <Input
                        id="printer-name"
                        value={formState.receiptPrinter.printerName}
                        onChange={(e) => handleNestedChange("receiptPrinter", "printerName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paper-size">Paper Size</Label>
                      <Select
                        value={formState.receiptPrinter.paperSize}
                        onValueChange={(value) => handleNestedChange("receiptPrinter", "paperSize", value)}
                      >
                        <SelectTrigger id="paper-size">
                          <SelectValue placeholder="Select paper size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="58mm">58mm</SelectItem>
                          <SelectItem value="80mm">80mm</SelectItem>
                          <SelectItem value="a4">A4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-print"
                      checked={formState.receiptPrinter.autoPrint}
                      onCheckedChange={(checked) => handleNestedChange("receiptPrinter", "autoPrint", checked)}
                    />
                    <Label htmlFor="auto-print">Automatically Print Receipts</Label>
                  </div>
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="customer-display">
          <AccordionTrigger>Customer Display</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="customer-display-enabled"
                  checked={formState.customerDisplay.enabled}
                  onCheckedChange={(checked) => handleNestedChange("customerDisplay", "enabled", checked)}
                />
                <Label htmlFor="customer-display-enabled">Enable Customer Display</Label>
              </div>

              {formState.customerDisplay.enabled && (
                <div className="space-y-2">
                  <Label htmlFor="display-type">Display Type</Label>
                  <Select
                    value={formState.customerDisplay.displayType}
                    onValueChange={(value) => handleNestedChange("customerDisplay", "displayType", value)}
                  >
                    <SelectTrigger id="display-type">
                      <SelectValue placeholder="Select display type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lcd">LCD Display</SelectItem>
                      <SelectItem value="led">LED Display</SelectItem>
                      <SelectItem value="tablet">Tablet/iPad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="barcode-scanner">
          <AccordionTrigger>Barcode Scanner</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="barcode-scanner-enabled"
                  checked={formState.barcodeScanner.enabled}
                  onCheckedChange={(checked) => handleNestedChange("barcodeScanner", "enabled", checked)}
                />
                <Label htmlFor="barcode-scanner-enabled">Enable Barcode Scanner</Label>
              </div>

              {formState.barcodeScanner.enabled && (
                <div className="space-y-2">
                  <Label htmlFor="scanner-type">Scanner Type</Label>
                  <Select
                    value={formState.barcodeScanner.scannerType}
                    onValueChange={(value) => handleNestedChange("barcodeScanner", "scannerType", value)}
                  >
                    <SelectTrigger id="scanner-type">
                      <SelectValue placeholder="Select scanner type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="handheld">Handheld Scanner</SelectItem>
                      <SelectItem value="embedded">Embedded Scanner</SelectItem>
                      <SelectItem value="mobile">Mobile Device Camera</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="cash-drawer">
          <AccordionTrigger>Cash Drawer</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="cash-drawer-enabled"
                  checked={formState.cashDrawer.enabled}
                  onCheckedChange={(checked) => handleNestedChange("cashDrawer", "enabled", checked)}
                />
                <Label htmlFor="cash-drawer-enabled">Enable Cash Drawer</Label>
              </div>

              {formState.cashDrawer.enabled && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="open-automatically"
                    checked={formState.cashDrawer.openAutomatically}
                    onCheckedChange={(checked) => handleNestedChange("cashDrawer", "openAutomatically", checked)}
                  />
                  <Label htmlFor="open-automatically">Open Automatically After Cash Payment</Label>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="payment-terminals">
          <AccordionTrigger>Payment Terminals</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="payment-terminals-enabled"
                  checked={formState.paymentTerminals.enabled}
                  onCheckedChange={(checked) => handleNestedChange("paymentTerminals", "enabled", checked)}
                />
                <Label htmlFor="payment-terminals-enabled">Enable Payment Terminals</Label>
              </div>

              {formState.paymentTerminals.enabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="terminal-type">Terminal Type</Label>
                    <Select
                      value={formState.paymentTerminals.terminalType}
                      onValueChange={(value) => handleNestedChange("paymentTerminals", "terminalType", value)}
                    >
                      <SelectTrigger id="terminal-type">
                        <SelectValue placeholder="Select terminal type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="integrated">Integrated Terminal</SelectItem>
                        <SelectItem value="standalone">Standalone Terminal</SelectItem>
                        <SelectItem value="mobile">Mobile Terminal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="connection-type">Connection Type</Label>
                    <Select
                      value={formState.paymentTerminals.connectionType}
                      onValueChange={(value) => handleNestedChange("paymentTerminals", "connectionType", value)}
                    >
                      <SelectTrigger id="connection-type">
                        <SelectValue placeholder="Select connection type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usb">USB</SelectItem>
                        <SelectItem value="bluetooth">Bluetooth</SelectItem>
                        <SelectItem value="wifi">Wi-Fi</SelectItem>
                        <SelectItem value="ethernet">Ethernet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="offline-mode">
          <AccordionTrigger>Offline Mode</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="offline-mode-enabled"
                  checked={formState.offlineMode.enabled}
                  onCheckedChange={(checked) => handleNestedChange("offlineMode", "enabled", checked)}
                />
                <Label htmlFor="offline-mode-enabled">Enable Offline Mode</Label>
              </div>

              {formState.offlineMode.enabled && (
                <div className="space-y-2">
                  <Label htmlFor="sync-interval">Sync Interval (minutes)</Label>
                  <Input
                    id="sync-interval"
                    type="number"
                    min="1"
                    value={formState.offlineMode.syncInterval}
                    onChange={(e) => handleNestedChange("offlineMode", "syncInterval", Number(e.target.value))}
                  />
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </div>
    </form>
  )
}

