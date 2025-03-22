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

interface PriceLevel {
  id: string
  name: string
  type: string
  value: number
  enabled: boolean
}

interface PricingSettings {
  enableMultiplePriceLevels: boolean
  priceLevels: PriceLevel[]
  roundingMethod: string
  roundingPrecision: number
  enableBulkPricing: boolean
  enableSeasonalPricing: boolean
  enableDynamicPricing: boolean
  dynamicPricingSettings: {
    minAdjustmentPercent: number
    maxAdjustmentPercent: number
    adjustBasedOn: string[]
  }
  enablePromotions: boolean
  promotionSettings: {
    allowStackingPromotions: boolean
    maxPromotionsPerProduct: number
  }
}

interface PricingSettingsFormProps {
  settings: PricingSettings
  onSave: (settings: PricingSettings) => void
  isSaving: boolean
}

export default function PricingSettingsForm({ settings, onSave, isSaving }: PricingSettingsFormProps) {
  const [formState, setFormState] = useState<PricingSettings>(settings)

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
        ...prev[section as keyof PricingSettings],
        [field]: value,
      },
    }))
  }

  const handleAddPriceLevel = () => {
    const newPriceLevel: PriceLevel = {
      id: `price-level-${Date.now()}`,
      name: "New Price Level",
      type: "percentage",
      value: 0,
      enabled: true,
    }
    setFormState((prev) => ({
      ...prev,
      priceLevels: [...prev.priceLevels, newPriceLevel],
    }))
  }

  const handleRemovePriceLevel = (id: string) => {
    setFormState((prev) => ({
      ...prev,
      priceLevels: prev.priceLevels.filter((level) => level.id !== id),
    }))
  }

  const handleUpdatePriceLevel = (id: string, field: string, value: any) => {
    setFormState((prev) => ({
      ...prev,
      priceLevels: prev.priceLevels.map((level) =>
        level.id === id
          ? {
              ...level,
              [field]: value,
            }
          : level,
      ),
    }))
  }

  const handleDynamicPricingFactorChange = (factor: string, checked: boolean) => {
    setFormState((prev) => {
      const currentFactors = prev.dynamicPricingSettings.adjustBasedOn
      const updatedFactors = checked ? [...currentFactors, factor] : currentFactors.filter((f) => f !== factor)

      return {
        ...prev,
        dynamicPricingSettings: {
          ...prev.dynamicPricingSettings,
          adjustBasedOn: updatedFactors,
        },
      }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formState)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Accordion type="single" collapsible defaultValue="price-levels">
        <AccordionItem value="price-levels">
          <AccordionTrigger>Price Levels</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-multiple-price-levels"
                  checked={formState.enableMultiplePriceLevels}
                  onCheckedChange={(checked) => handleChange("enableMultiplePriceLevels", checked)}
                />
                <Label htmlFor="enable-multiple-price-levels">Enable Multiple Price Levels</Label>
              </div>

              {formState.enableMultiplePriceLevels && (
                <>
                  <div className="flex justify-end">
                    <Button type="button" onClick={handleAddPriceLevel} variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Price Level
                    </Button>
                  </div>

                  {formState.priceLevels.map((level) => (
                    <Card key={level.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="mb-4 flex items-center justify-between">
                          <h4 className="text-lg font-medium">{level.name}</h4>
                          <Button
                            type="button"
                            onClick={() => handleRemovePriceLevel(level.id)}
                            variant="ghost"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor={`level-name-${level.id}`}>Level Name</Label>
                            <Input
                              id={`level-name-${level.id}`}
                              value={level.name}
                              onChange={(e) => handleUpdatePriceLevel(level.id, "name", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`level-type-${level.id}`}>Adjustment Type</Label>
                            <Select
                              value={level.type}
                              onValueChange={(value) => handleUpdatePriceLevel(level.id, "type", value)}
                            >
                              <SelectTrigger id={`level-type-${level.id}`}>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="percentage">Percentage</SelectItem>
                                <SelectItem value="fixed">Fixed Amount</SelectItem>
                                <SelectItem value="markup">Markup</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor={`level-value-${level.id}`}>
                              {level.type === "percentage"
                                ? "Percentage (%)"
                                : level.type === "fixed"
                                  ? "Fixed Amount"
                                  : "Markup (%)"}
                            </Label>
                            <Input
                              id={`level-value-${level.id}`}
                              type="number"
                              step={level.type === "fixed" ? "0.01" : "0.1"}
                              min={level.type === "percentage" ? "-100" : level.type === "fixed" ? "-1000" : "0"}
                              value={level.value}
                              onChange={(e) => handleUpdatePriceLevel(level.id, "value", Number(e.target.value))}
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`level-enabled-${level.id}`}
                              checked={level.enabled}
                              onCheckedChange={(checked) => handleUpdatePriceLevel(level.id, "enabled", checked)}
                            />
                            <Label htmlFor={`level-enabled-${level.id}`}>Enabled</Label>
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

        <AccordionItem value="price-rounding">
          <AccordionTrigger>Price Rounding</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rounding-method">Rounding Method</Label>
                  <Select
                    value={formState.roundingMethod}
                    onValueChange={(value) => handleChange("roundingMethod", value)}
                  >
                    <SelectTrigger id="rounding-method">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Rounding</SelectItem>
                      <SelectItem value="nearest">Nearest</SelectItem>
                      <SelectItem value="up">Round Up</SelectItem>
                      <SelectItem value="down">Round Down</SelectItem>
                      <SelectItem value="psychological">Psychological (.99)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rounding-precision">Rounding Precision</Label>
                  <Select
                    value={formState.roundingPrecision.toString()}
                    onValueChange={(value) => handleChange("roundingPrecision", Number(value))}
                  >
                    <SelectTrigger id="rounding-precision">
                      <SelectValue placeholder="Select precision" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.01">0.01 (Penny)</SelectItem>
                      <SelectItem value="0.05">0.05 (Nickel)</SelectItem>
                      <SelectItem value="0.1">0.10 (Dime)</SelectItem>
                      <SelectItem value="0.25">0.25 (Quarter)</SelectItem>
                      <SelectItem value="0.5">0.50 (Half Dollar)</SelectItem>
                      <SelectItem value="1">1.00 (Dollar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="special-pricing">
          <AccordionTrigger>Special Pricing Options</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable-bulk-pricing"
                    checked={formState.enableBulkPricing}
                    onCheckedChange={(checked) => handleChange("enableBulkPricing", checked)}
                  />
                  <Label htmlFor="enable-bulk-pricing">Enable Bulk Pricing</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable-seasonal-pricing"
                    checked={formState.enableSeasonalPricing}
                    onCheckedChange={(checked) => handleChange("enableSeasonalPricing", checked)}
                  />
                  <Label htmlFor="enable-seasonal-pricing">Enable Seasonal Pricing</Label>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="dynamic-pricing">
          <AccordionTrigger>Dynamic Pricing</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-dynamic-pricing"
                  checked={formState.enableDynamicPricing}
                  onCheckedChange={(checked) => handleChange("enableDynamicPricing", checked)}
                />
                <Label htmlFor="enable-dynamic-pricing">Enable Dynamic Pricing</Label>
              </div>

              {formState.enableDynamicPricing && (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="min-adjustment">Minimum Adjustment (%)</Label>
                      <Input
                        id="min-adjustment"
                        type="number"
                        min="-50"
                        max="0"
                        value={formState.dynamicPricingSettings.minAdjustmentPercent}
                        onChange={(e) =>
                          handleNestedChange("dynamicPricingSettings", "minAdjustmentPercent", Number(e.target.value))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-adjustment">Maximum Adjustment (%)</Label>
                      <Input
                        id="max-adjustment"
                        type="number"
                        min="0"
                        max="100"
                        value={formState.dynamicPricingSettings.maxAdjustmentPercent}
                        onChange={(e) =>
                          handleNestedChange("dynamicPricingSettings", "maxAdjustmentPercent", Number(e.target.value))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Adjust Prices Based On:</Label>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="adjust-inventory"
                          checked={formState.dynamicPricingSettings.adjustBasedOn.includes("inventory")}
                          onCheckedChange={(checked) => handleDynamicPricingFactorChange("inventory", checked)}
                        />
                        <Label htmlFor="adjust-inventory">Inventory Levels</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="adjust-demand"
                          checked={formState.dynamicPricingSettings.adjustBasedOn.includes("demand")}
                          onCheckedChange={(checked) => handleDynamicPricingFactorChange("demand", checked)}
                        />
                        <Label htmlFor="adjust-demand">Customer Demand</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="adjust-time"
                          checked={formState.dynamicPricingSettings.adjustBasedOn.includes("time")}
                          onCheckedChange={(checked) => handleDynamicPricingFactorChange("time", checked)}
                        />
                        <Label htmlFor="adjust-time">Time of Day</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="adjust-season"
                          checked={formState.dynamicPricingSettings.adjustBasedOn.includes("season")}
                          onCheckedChange={(checked) => handleDynamicPricingFactorChange("season", checked)}
                        />
                        <Label htmlFor="adjust-season">Seasonal Factors</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="adjust-competition"
                          checked={formState.dynamicPricingSettings.adjustBasedOn.includes("competition")}
                          onCheckedChange={(checked) => handleDynamicPricingFactorChange("competition", checked)}
                        />
                        <Label htmlFor="adjust-competition">Competitor Pricing</Label>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="promotions">
          <AccordionTrigger>Promotions</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-promotions"
                  checked={formState.enablePromotions}
                  onCheckedChange={(checked) => handleChange("enablePromotions", checked)}
                />
                <Label htmlFor="enable-promotions">Enable Promotions</Label>
              </div>

              {formState.enablePromotions && (
                <>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="allow-stacking"
                      checked={formState.promotionSettings.allowStackingPromotions}
                      onCheckedChange={(checked) =>
                        handleNestedChange("promotionSettings", "allowStackingPromotions", checked)
                      }
                    />
                    <Label htmlFor="allow-stacking">Allow Stacking Promotions</Label>
                  </div>

                  {formState.promotionSettings.allowStackingPromotions && (
                    <div className="space-y-2">
                      <Label htmlFor="max-promotions">Maximum Promotions Per Product</Label>
                      <Input
                        id="max-promotions"
                        type="number"
                        min="1"
                        max="10"
                        value={formState.promotionSettings.maxPromotionsPerProduct}
                        onChange={(e) =>
                          handleNestedChange("promotionSettings", "maxPromotionsPerProduct", Number(e.target.value))
                        }
                      />
                    </div>
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

