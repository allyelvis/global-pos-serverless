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

interface InventorySettings {
  trackInventory: boolean
  lowStockThreshold: number
  outOfStockBehavior: string
  inventoryCountFrequency: string
  barcodeSystem: {
    type: string
    prefix: string
    autoGenerate: boolean
  }
  multiLocation: {
    enabled: boolean
    allowTransfers: boolean
    requireApproval: boolean
  }
  suppliers: {
    trackSuppliers: boolean
    autoReorder: boolean
    reorderThreshold: number
  }
  batchTracking: {
    enabled: boolean
    trackExpiryDates: boolean
    warnBeforeExpiry: boolean
    expiryWarningDays: number
  }
  costCalculation: string
}

interface InventorySettingsFormProps {
  settings: InventorySettings
  onSave: (settings: InventorySettings) => void
  isSaving: boolean
}

export default function InventorySettingsForm({ settings, onSave, isSaving }: InventorySettingsFormProps) {
  const [formState, setFormState] = useState<InventorySettings>(settings)

  const handleChange = (field: string, value: any) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleNestedChange = (section: string, field: string, value: any) => {
    setFormState((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof InventorySettings],
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
      <Accordion type="single" collapsible defaultValue="general-inventory">
        <AccordionItem value="general-inventory">
          <AccordionTrigger>General Inventory Settings</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="track-inventory"
                  checked={formState.trackInventory}
                  onCheckedChange={(checked) => handleChange("trackInventory", checked)}
                />
                <Label htmlFor="track-inventory">Track Inventory</Label>
              </div>

              {formState.trackInventory && (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="low-stock-threshold">Low Stock Threshold</Label>
                      <Input
                        id="low-stock-threshold"
                        type="number"
                        min="0"
                        value={formState.lowStockThreshold}
                        onChange={(e) => handleChange("lowStockThreshold", Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="out-of-stock-behavior">Out of Stock Behavior</Label>
                      <Select
                        value={formState.outOfStockBehavior}
                        onValueChange={(value) => handleChange("outOfStockBehavior", value)}
                      >
                        <SelectTrigger id="out-of-stock-behavior">
                          <SelectValue placeholder="Select behavior" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hide">Hide Product</SelectItem>
                          <SelectItem value="show-unavailable">Show as Unavailable</SelectItem>
                          <SelectItem value="allow-backorder">Allow Backorder</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inventory-count-frequency">Inventory Count Frequency</Label>
                    <Select
                      value={formState.inventoryCountFrequency}
                      onValueChange={(value) => handleChange("inventoryCountFrequency", value)}
                    >
                      <SelectTrigger id="inventory-count-frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="barcode-system">
          <AccordionTrigger>Barcode System</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="barcode-type">Barcode Type</Label>
                <Select
                  value={formState.barcodeSystem.type}
                  onValueChange={(value) => handleNestedChange("barcodeSystem", "type", value)}
                >
                  <SelectTrigger id="barcode-type">
                    <SelectValue placeholder="Select barcode type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upc">UPC</SelectItem>
                    <SelectItem value="ean">EAN</SelectItem>
                    <SelectItem value="isbn">ISBN</SelectItem>
                    <SelectItem value="qr">QR Code</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formState.barcodeSystem.type === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="barcode-prefix">Barcode Prefix</Label>
                  <Input
                    id="barcode-prefix"
                    value={formState.barcodeSystem.prefix}
                    onChange={(e) => handleNestedChange("barcodeSystem", "prefix", e.target.value)}
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-generate-barcode"
                  checked={formState.barcodeSystem.autoGenerate}
                  onCheckedChange={(checked) => handleNestedChange("barcodeSystem", "autoGenerate", checked)}
                />
                <Label htmlFor="auto-generate-barcode">Auto-Generate Barcodes for New Products</Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="multi-location">
          <AccordionTrigger>Multi-Location Inventory</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="multi-location-enabled"
                  checked={formState.multiLocation.enabled}
                  onCheckedChange={(checked) => handleNestedChange("multiLocation", "enabled", checked)}
                />
                <Label htmlFor="multi-location-enabled">Enable Multi-Location Inventory</Label>
              </div>

              {formState.multiLocation.enabled && (
                <>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="allow-transfers"
                      checked={formState.multiLocation.allowTransfers}
                      onCheckedChange={(checked) => handleNestedChange("multiLocation", "allowTransfers", checked)}
                    />
                    <Label htmlFor="allow-transfers">Allow Inventory Transfers Between Locations</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="require-approval"
                      checked={formState.multiLocation.requireApproval}
                      onCheckedChange={(checked) => handleNestedChange("multiLocation", "requireApproval", checked)}
                    />
                    <Label htmlFor="require-approval">Require Approval for Transfers</Label>
                  </div>
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="suppliers">
          <AccordionTrigger>Suppliers & Reordering</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="track-suppliers"
                  checked={formState.suppliers.trackSuppliers}
                  onCheckedChange={(checked) => handleNestedChange("suppliers", "trackSuppliers", checked)}
                />
                <Label htmlFor="track-suppliers">Track Suppliers</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-reorder"
                  checked={formState.suppliers.autoReorder}
                  onCheckedChange={(checked) => handleNestedChange("suppliers", "autoReorder", checked)}
                />
                <Label htmlFor="auto-reorder">Enable Automatic Reordering</Label>
              </div>

              {formState.suppliers.autoReorder && (
                <div className="space-y-2">
                  <Label htmlFor="reorder-threshold">Reorder Threshold (% of Low Stock)</Label>
                  <Input
                    id="reorder-threshold"
                    type="number"
                    min="0"
                    max="100"
                    value={formState.suppliers.reorderThreshold}
                    onChange={(e) => handleNestedChange("suppliers", "reorderThreshold", Number(e.target.value))}
                  />
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="batch-tracking">
          <AccordionTrigger>Batch & Expiry Tracking</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="batch-tracking-enabled"
                  checked={formState.batchTracking.enabled}
                  onCheckedChange={(checked) => handleNestedChange("batchTracking", "enabled", checked)}
                />
                <Label htmlFor="batch-tracking-enabled">Enable Batch Tracking</Label>
              </div>

              {formState.batchTracking.enabled && (
                <>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="track-expiry"
                      checked={formState.batchTracking.trackExpiryDates}
                      onCheckedChange={(checked) => handleNestedChange("batchTracking", "trackExpiryDates", checked)}
                    />
                    <Label htmlFor="track-expiry">Track Expiry Dates</Label>
                  </div>

                  {formState.batchTracking.trackExpiryDates && (
                    <>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="warn-expiry"
                          checked={formState.batchTracking.warnBeforeExpiry}
                          onCheckedChange={(checked) =>
                            handleNestedChange("batchTracking", "warnBeforeExpiry", checked)
                          }
                        />
                        <Label htmlFor="warn-expiry">Warn Before Expiry</Label>
                      </div>

                      {formState.batchTracking.warnBeforeExpiry && (
                        <div className="space-y-2">
                          <Label htmlFor="expiry-warning-days">Warning Days Before Expiry</Label>
                          <Input
                            id="expiry-warning-days"
                            type="number"
                            min="1"
                            value={formState.batchTracking.expiryWarningDays}
                            onChange={(e) =>
                              handleNestedChange("batchTracking", "expiryWarningDays", Number(e.target.value))
                            }
                          />
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="cost-calculation">
          <AccordionTrigger>Cost Calculation Method</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cost-calculation">Cost Calculation Method</Label>
                <Select
                  value={formState.costCalculation}
                  onValueChange={(value) => handleChange("costCalculation", value)}
                >
                  <SelectTrigger id="cost-calculation">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fifo">FIFO (First In, First Out)</SelectItem>
                    <SelectItem value="lifo">LIFO (Last In, First Out)</SelectItem>
                    <SelectItem value="average">Average Cost</SelectItem>
                    <SelectItem value="specific">Specific Identification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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

