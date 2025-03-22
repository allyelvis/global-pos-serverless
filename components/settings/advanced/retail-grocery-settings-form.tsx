"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface RetailGrocerySettings {
  barcodeScanning: {
    enabled: boolean
    scannerType: string
    autoGenerateBarcodes: boolean
  }
  weighingScale: {
    enabled: boolean
    scaleType: string
    autoDetectWeight: boolean
    requireWeightVerification: boolean
  }
  shelfLabels: {
    enabled: boolean
    showPricePerUnit: boolean
    showDiscounts: boolean
    enableDigitalLabels: boolean
  }
  selfCheckout: {
    enabled: boolean
    requireAttendantApproval: boolean
    allowCashPayments: boolean
    weightVerification: boolean
  }
  productCategories: {
    enableDepartments: boolean
    enableSubcategories: boolean
    enableAttributes: boolean
    enableVariants: boolean
  }
  inventoryManagement: {
    trackInventory: boolean
    lowStockAlerts: boolean
    enableAutoReorder: boolean
    trackExpiryDates: boolean
    enableFIFO: boolean
  }
  pricingOptions: {
    enableBulkPricing: boolean
    enableQuantityDiscounts: boolean
    enableMemberPricing: boolean
    enableTimedPromotions: boolean
  }
}

interface RetailGrocerySettingsFormProps {
  settings: RetailGrocerySettings
  onSave: (settings: RetailGrocerySettings) => void
  isSaving: boolean
}

export default function RetailGrocerySettingsForm({ settings, onSave, isSaving }: RetailGrocerySettingsFormProps) {
  const [formState, setFormState] = useState<RetailGrocerySettings>(settings)

  const handleNestedChange = (section: string, field: string, value: any) => {
    setFormState((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof RetailGrocerySettings],
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
      <Accordion type="single" collapsible defaultValue="barcode-scanning">
        <AccordionItem value="barcode-scanning">
          <AccordionTrigger>Barcode Scanning</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-barcode"
                  checked={formState.barcodeScanning.enabled}
                  onCheckedChange={(checked) => handleNestedChange("barcodeScanning", "enabled", checked)}
                />
                <Label htmlFor="enable-barcode">Enable Barcode Scanning</Label>
              </div>

              {formState.barcodeScanning.enabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="scanner-type">Scanner Type</Label>
                    <Select
                      value={formState.barcodeScanning.scannerType}
                      onValueChange={(value) => handleNestedChange("barcodeScanning", "scannerType", value)}
                    >
                      <SelectTrigger id="scanner-type">
                        <SelectValue placeholder="Select scanner type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="handheld">Handheld Scanner</SelectItem>
                        <SelectItem value="embedded">Embedded Scanner</SelectItem>
                        <SelectItem value="mobile">Mobile Device Camera</SelectItem>
                        <SelectItem value="multi-plane">Multi-Plane Scanner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-generate-barcodes"
                      checked={formState.barcodeScanning.autoGenerateBarcodes}
                      onCheckedChange={(checked) =>
                        handleNestedChange("barcodeScanning", "autoGenerateBarcodes", checked)
                      }
                    />
                    <Label htmlFor="auto-generate-barcodes">Auto-Generate Barcodes</Label>
                  </div>
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="weighing-scale">
          <AccordionTrigger>Weighing Scale</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-scale"
                  checked={formState.weighingScale.enabled}
                  onCheckedChange={(checked) => handleNestedChange("weighingScale", "enabled", checked)}
                />
                <Label htmlFor="enable-scale">Enable Weighing Scale</Label>
              </div>

              {formState.weighingScale.enabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="scale-type">Scale Type</Label>
                    <Select
                      value={formState.weighingScale.scaleType}
                      onValueChange={(value) => handleNestedChange("weighingScale", "scaleType", value)}
                    >
                      <SelectTrigger id="scale-type">
                        <SelectValue placeholder="Select scale type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="integrated">Integrated Scale</SelectItem>
                        <SelectItem value="standalone">Standalone Scale</SelectItem>
                        <SelectItem value="label-printing">Label Printing Scale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-detect-weight"
                      checked={formState.weighingScale.autoDetectWeight}
                      onCheckedChange={(checked) => handleNestedChange("weighingScale", "autoDetectWeight", checked)}
                    />
                    <Label htmlFor="auto-detect-weight">Auto-Detect Weight</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="require-weight-verification"
                      checked={formState.weighingScale.requireWeightVerification}
                      onCheckedChange={(checked) =>
                        handleNestedChange("weighingScale", "requireWeightVerification", checked)
                      }
                    />
                    <Label htmlFor="require-weight-verification">Require Weight Verification</Label>
                  </div>
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="shelf-labels">
          <AccordionTrigger>Shelf Labels</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-shelf-labels"
                  checked={formState.shelfLabels.enabled}
                  onCheckedChange={(checked) => handleNestedChange("shelfLabels", "enabled", checked)}
                />
                <Label htmlFor="enable-shelf-labels">Enable Shelf Labels</Label>
              </div>

              {formState.shelfLabels.enabled && (
                <>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-price-per-unit"
                      checked={formState.shelfLabels.showPricePerUnit}
                      onCheckedChange={(checked) => handleNestedChange("shelfLabels", "showPricePerUnit", checked)}
                    />
                    <Label htmlFor="show-price-per-unit">Show Price Per Unit</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-discounts"
                      checked={formState.shelfLabels.showDiscounts}
                      onCheckedChange={(checked) => handleNestedChange("shelfLabels", "showDiscounts", checked)}
                    />
                    <Label htmlFor="show-discounts">Show Discounts</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enable-digital-labels"
                      checked={formState.shelfLabels.enableDigitalLabels}
                      onCheckedChange={(checked) => handleNestedChange("shelfLabels", "enableDigitalLabels", checked)}
                    />
                    <Label htmlFor="enable-digital-labels">Enable Digital Labels</Label>
                  </div>
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="self-checkout">
          <AccordionTrigger>Self-Checkout</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-self-checkout"
                  checked={formState.selfCheckout.enabled}
                  onCheckedChange={(checked) => handleNestedChange("selfCheckout", "enabled", checked)}
                />
                <Label htmlFor="enable-self-checkout">Enable Self-Checkout</Label>
              </div>

              {formState.selfCheckout.enabled && (
                <>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="require-attendant-approval"
                      checked={formState.selfCheckout.requireAttendantApproval}
                      onCheckedChange={(checked) =>
                        handleNestedChange("selfCheckout", "requireAttendantApproval", checked)
                      }
                    />
                    <Label htmlFor="require-attendant-approval">Require Attendant Approval</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="allow-cash-payments"
                      checked={formState.selfCheckout.allowCashPayments}
                      onCheckedChange={(checked) => handleNestedChange("selfCheckout", "allowCashPayments", checked)}
                    />
                    <Label htmlFor="allow-cash-payments">Allow Cash Payments</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="weight-verification"
                      checked={formState.selfCheckout.weightVerification}
                      onCheckedChange={(checked) => handleNestedChange("selfCheckout", "weightVerification", checked)}
                    />
                    <Label htmlFor="weight-verification">Weight Verification</Label>
                  </div>
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="product-categories">
          <AccordionTrigger>Product Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-departments"
                  checked={formState.productCategories.enableDepartments}
                  onCheckedChange={(checked) => handleNestedChange("productCategories", "enableDepartments", checked)}
                />
                <Label htmlFor="enable-departments">Enable Departments</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-subcategories"
                  checked={formState.productCategories.enableSubcategories}
                  onCheckedChange={(checked) => handleNestedChange("productCategories", "enableSubcategories", checked)}
                />
                <Label htmlFor="enable-subcategories">Enable Subcategories</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-attributes"
                  checked={formState.productCategories.enableAttributes}
                  onCheckedChange={(checked) => handleNestedChange("productCategories", "enableAttributes", checked)}
                />
                <Label htmlFor="enable-attributes">Enable Product Attributes</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-variants"
                  checked={formState.productCategories.enableVariants}
                  onCheckedChange={(checked) => handleNestedChange("productCategories", "enableVariants", checked)}
                />
                <Label htmlFor="enable-variants">Enable Product Variants</Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="inventory-management">
          <AccordionTrigger>Inventory Management</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="track-inventory"
                  checked={formState.inventoryManagement.trackInventory}
                  onCheckedChange={(checked) => handleNestedChange("inventoryManagement", "trackInventory", checked)}
                />
                <Label htmlFor="track-inventory">Track Inventory</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="low-stock-alerts"
                  checked={formState.inventoryManagement.lowStockAlerts}
                  onCheckedChange={(checked) => handleNestedChange("inventoryManagement", "lowStockAlerts", checked)}
                />
                <Label htmlFor="low-stock-alerts">Low Stock Alerts</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-auto-reorder"
                  checked={formState.inventoryManagement.enableAutoReorder}
                  onCheckedChange={(checked) => handleNestedChange("inventoryManagement", "enableAutoReorder", checked)}
                />
                <Label htmlFor="enable-auto-reorder">Enable Auto-Reorder</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="track-expiry-dates"
                  checked={formState.inventoryManagement.trackExpiryDates}
                  onCheckedChange={(checked) => handleNestedChange("inventoryManagement", "trackExpiryDates", checked)}
                />
                <Label htmlFor="track-expiry-dates">Track Expiry Dates</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-fifo"
                  checked={formState.inventoryManagement.enableFIFO}
                  onCheckedChange={(checked) => handleNestedChange("inventoryManagement", "enableFIFO", checked)}
                />
                <Label htmlFor="enable-fifo">Enable FIFO (First In, First Out)</Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="pricing-options">
          <AccordionTrigger>Pricing Options</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-bulk-pricing"
                  checked={formState.pricingOptions.enableBulkPricing}
                  onCheckedChange={(checked) => handleNestedChange("pricingOptions", "enableBulkPricing", checked)}
                />
                <Label htmlFor="enable-bulk-pricing">Enable Bulk Pricing</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-quantity-discounts"
                  checked={formState.pricingOptions.enableQuantityDiscounts}
                  onCheckedChange={(checked) =>
                    handleNestedChange("pricingOptions", "enableQuantityDiscounts", checked)
                  }
                />
                <Label htmlFor="enable-quantity-discounts">Enable Quantity Discounts</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-member-pricing"
                  checked={formState.pricingOptions.enableMemberPricing}
                  onCheckedChange={(checked) => handleNestedChange("pricingOptions", "enableMemberPricing", checked)}
                />
                <Label htmlFor="enable-member-pricing">Enable Member Pricing</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-timed-promotions"
                  checked={formState.pricingOptions.enableTimedPromotions}
                  onCheckedChange={(checked) => handleNestedChange("pricingOptions", "enableTimedPromotions", checked)}
                />
                <Label htmlFor="enable-timed-promotions">Enable Timed Promotions</Label>
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

