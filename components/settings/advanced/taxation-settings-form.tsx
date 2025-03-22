"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"

interface TaxRate {
  id: string
  name: string
  rate: number
  isDefault: boolean
  applyToShipping: boolean
  enabled: boolean
}

interface TaxExemption {
  id: string
  name: string
  code: string
  requireVerification: boolean
  enabled: boolean
}

interface TaxationSettings {
  enableTaxation: boolean
  taxInclusivePricing: boolean
  calculateTaxBasedOn: string
  roundTaxAtSubtotalLevel: boolean
  displayTaxTotalsOnReceipts: boolean
  taxRates: TaxRate[]
  taxExemptions: TaxExemption[]
  digitalTaxes: {
    enableDigitalTaxes: boolean
    collectVATForDigitalGoods: boolean
    digitalGoodsTaxRate: number
  }
  taxReporting: {
    generateTaxReports: boolean
    reportFrequency: string
    includeExemptSales: boolean
  }
}

interface TaxationSettingsFormProps {
  settings: TaxationSettings
  onSave: (settings: TaxationSettings) => void
  isSaving: boolean
}

export default function TaxationSettingsForm({ settings, onSave, isSaving }: TaxationSettingsFormProps) {
  const [formState, setFormState] = useState<TaxationSettings>(settings)

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
        ...prev[section as keyof TaxationSettings],
        [field]: value,
      },
    }))
  }

  const handleAddTaxRate = () => {
    const newTaxRate: TaxRate = {
      id: `tax-rate-${Date.now()}`,
      name: "New Tax Rate",
      rate: 0,
      isDefault: false,
      applyToShipping: false,
      enabled: true,
    }
    setFormState((prev) => ({
      ...prev,
      taxRates: [...prev.taxRates, newTaxRate],
    }))
  }

  const handleRemoveTaxRate = (id: string) => {
    setFormState((prev) => ({
      ...prev,
      taxRates: prev.taxRates.filter((rate) => rate.id !== id),
    }))
  }

  const handleUpdateTaxRate = (id: string, field: string, value: any) => {
    setFormState((prev) => {
      // If setting this rate as default, unset others
      if (field === "isDefault" && value === true) {
        return {
          ...prev,
          taxRates: prev.taxRates.map((rate) => ({
            ...rate,
            isDefault: rate.id === id,
          })),
        }
      }

      return {
        ...prev,
        taxRates: prev.taxRates.map((rate) =>
          rate.id === id
            ? {
                ...rate,
                [field]: value,
              }
            : rate,
        ),
      }
    })
  }

  const handleAddTaxExemption = () => {
    const newTaxExemption: TaxExemption = {
      id: `tax-exemption-${Date.now()}`,
      name: "New Tax Exemption",
      code: "",
      requireVerification: true,
      enabled: true,
    }
    setFormState((prev) => ({
      ...prev,
      taxExemptions: [...prev.taxExemptions, newTaxExemption],
    }))
  }

  const handleRemoveTaxExemption = (id: string) => {
    setFormState((prev) => ({
      ...prev,
      taxExemptions: prev.taxExemptions.filter((exemption) => exemption.id !== id),
    }))
  }

  const handleUpdateTaxExemption = (id: string, field: string, value: any) => {
    setFormState((prev) => ({
      ...prev,
      taxExemptions: prev.taxExemptions.map((exemption) =>
        exemption.id === id
          ? {
              ...exemption,
              [field]: value,
            }
          : exemption,
      ),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formState)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Accordion type="single" collapsible defaultValue="general-taxation">
        <AccordionItem value="general-taxation">
          <AccordionTrigger>General Taxation Settings</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-taxation"
                  checked={formState.enableTaxation}
                  onCheckedChange={(checked) => handleChange("enableTaxation", checked)}
                />
                <Label htmlFor="enable-taxation">Enable Taxation</Label>
              </div>

              {formState.enableTaxation && (
                <>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="tax-inclusive-pricing"
                      checked={formState.taxInclusivePricing}
                      onCheckedChange={(checked) => handleChange("taxInclusivePricing", checked)}
                    />
                    <Label htmlFor="tax-inclusive-pricing">Tax-Inclusive Pricing</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="calculate-tax-based-on">Calculate Tax Based On</Label>
                    <Select
                      value={formState.calculateTaxBasedOn}
                      onValueChange={(value) => handleChange("calculateTaxBasedOn", value)}
                    >
                      <SelectTrigger id="calculate-tax-based-on">
                        <SelectValue placeholder="Select calculation basis" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shipping">Shipping Address</SelectItem>
                        <SelectItem value="billing">Billing Address</SelectItem>
                        <SelectItem value="store">Store Address</SelectItem>
                        <SelectItem value="origin">Origin Based</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="round-tax"
                      checked={formState.roundTaxAtSubtotalLevel}
                      onCheckedChange={(checked) => handleChange("roundTaxAtSubtotalLevel", checked)}
                    />
                    <Label htmlFor="round-tax">Round Tax at Subtotal Level</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="display-tax-totals"
                      checked={formState.displayTaxTotalsOnReceipts}
                      onCheckedChange={(checked) => handleChange("displayTaxTotalsOnReceipts", checked)}
                    />
                    <Label htmlFor="display-tax-totals">Display Tax Totals on Receipts</Label>
                  </div>
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="tax-rates">
          <AccordionTrigger>Tax Rates</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              {formState.enableTaxation && (
                <>
                  <div className="flex justify-end">
                    <Button type="button" onClick={handleAddTaxRate} variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Tax Rate
                    </Button>
                  </div>

                  {formState.taxRates.map((rate) => (
                    <Card key={rate.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="mb-4 flex items-center justify-between">
                          <h4 className="text-lg font-medium">{rate.name}</h4>
                          <Button type="button" onClick={() => handleRemoveTaxRate(rate.id)} variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor={`rate-name-${rate.id}`}>Tax Rate Name</Label>
                            <Input
                              id={`rate-name-${rate.id}`}
                              value={rate.name}
                              onChange={(e) => handleUpdateTaxRate(rate.id, "name", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`rate-value-${rate.id}`}>Tax Rate (%)</Label>
                            <Input
                              id={`rate-value-${rate.id}`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={rate.rate}
                              onChange={(e) => handleUpdateTaxRate(rate.id, "rate", Number(e.target.value))}
                            />
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`is-default-${rate.id}`}
                              checked={rate.isDefault}
                              onCheckedChange={(checked) => handleUpdateTaxRate(rate.id, "isDefault", checked)}
                            />
                            <Label htmlFor={`is-default-${rate.id}`}>Default Rate</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`apply-shipping-${rate.id}`}
                              checked={rate.applyToShipping}
                              onCheckedChange={(checked) => handleUpdateTaxRate(rate.id, "applyToShipping", checked)}
                            />
                            <Label htmlFor={`apply-shipping-${rate.id}`}>Apply to Shipping</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`rate-enabled-${rate.id}`}
                              checked={rate.enabled}
                              onCheckedChange={(checked) => handleUpdateTaxRate(rate.id, "enabled", checked)}
                            />
                            <Label htmlFor={`rate-enabled-${rate.id}`}>Enabled</Label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="tax-exemptions">
          <AccordionTrigger>Tax Exemptions</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              {formState.enableTaxation && (
                <>
                  <div className="flex justify-end">
                    <Button type="button" onClick={handleAddTaxExemption} variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Tax Exemption
                    </Button>
                  </div>

                  {formState.taxExemptions.map((exemption) => (
                    <Card key={exemption.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="mb-4 flex items-center justify-between">
                          <h4 className="text-lg font-medium">{exemption.name}</h4>
                          <Button
                            type="button"
                            onClick={() => handleRemoveTaxExemption(exemption.id)}
                            variant="ghost"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor={`exemption-name-${exemption.id}`}>Exemption Name</Label>
                            <Input
                              id={`exemption-name-${exemption.id}`}
                              value={exemption.name}
                              onChange={(e) => handleUpdateTaxExemption(exemption.id, "name", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`exemption-code-${exemption.id}`}>Exemption Code</Label>
                            <Input
                              id={`exemption-code-${exemption.id}`}
                              value={exemption.code}
                              onChange={(e) => handleUpdateTaxExemption(exemption.id, "code", e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`require-verification-${exemption.id}`}
                              checked={exemption.requireVerification}
                              onCheckedChange={(checked) =>
                                handleUpdateTaxExemption(exemption.id, "requireVerification", checked)
                              }
                            />
                            <Label htmlFor={`require-verification-${exemption.id}`}>Require Verification</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`exemption-enabled-${exemption.id}`}
                              checked={exemption.enabled}
                              onCheckedChange={(checked) => handleUpdateTaxExemption(exemption.id, "enabled", checked)}
                            />
                            <Label htmlFor={`exemption-enabled-${exemption.id}`}>Enabled</Label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="digital-taxes">
          <AccordionTrigger>Digital Taxes</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              {formState.enableTaxation && (
                <>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enable-digital-taxes"
                      checked={formState.digitalTaxes.enableDigitalTaxes}
                      onCheckedChange={(checked) => handleNestedChange("digitalTaxes", "enableDigitalTaxes", checked)}
                    />
                    <Label htmlFor="enable-digital-taxes">Enable Digital Taxes</Label>
                  </div>

                  {formState.digitalTaxes.enableDigitalTaxes && (
                    <>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="collect-vat"
                          checked={formState.digitalTaxes.collectVATForDigitalGoods}
                          onCheckedChange={(checked) =>
                            handleNestedChange("digitalTaxes", "collectVATForDigitalGoods", checked)
                          }
                        />
                        <Label htmlFor="collect-vat">Collect VAT for Digital Goods</Label>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="digital-tax-rate">Digital Goods Tax Rate (%)</Label>
                        <Input
                          id="digital-tax-rate"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formState.digitalTaxes.digitalGoodsTaxRate}
                          onChange={(e) =>
                            handleNestedChange("digitalTaxes", "digitalGoodsTaxRate", Number(e.target.value))
                          }
                        />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="tax-reporting">
          <AccordionTrigger>Tax Reporting</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              {formState.enableTaxation && (
                <>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="generate-tax-reports"
                      checked={formState.taxReporting.generateTaxReports}
                      onCheckedChange={(checked) => handleNestedChange("taxReporting", "generateTaxReports", checked)}
                    />
                    <Label htmlFor="generate-tax-reports">Generate Tax Reports</Label>
                  </div>

                  {formState.taxReporting.generateTaxReports && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="report-frequency">Report Frequency</Label>
                        <Select
                          value={formState.taxReporting.reportFrequency}
                          onValueChange={(value) => handleNestedChange("taxReporting", "reportFrequency", value)}
                        >
                          <SelectTrigger id="report-frequency">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="annually">Annually</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="include-exempt-sales"
                          checked={formState.taxReporting.includeExemptSales}
                          onCheckedChange={(checked) =>
                            handleNestedChange("taxReporting", "includeExemptSales", checked)
                          }
                        />
                        <Label htmlFor="include-exempt-sales">Include Exempt Sales in Reports</Label>
                      </div>
                    </>
                  )}
                </>
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

