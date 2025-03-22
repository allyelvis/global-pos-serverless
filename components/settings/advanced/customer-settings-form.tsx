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

interface LoyaltyTier {
  id: string
  name: string
  minimumPoints: number
  discountPercentage: number
  pointsMultiplier: number
  enabled: boolean
}

interface CustomerSettings {
  enableCustomerAccounts: boolean
  requirePhoneNumber: boolean
  requireEmail: boolean
  enableLoyaltyProgram: boolean
  loyaltySettings: {
    pointsPerCurrency: number
    pointsExpiryDays: number
    minimumPointsRedemption: number
    tiers: LoyaltyTier[]
  }
  customerGroups: {
    enabled: boolean
    allowCustomPricing: boolean
  }
  feedback: {
    collectFeedback: boolean
    feedbackMethod: string
    sendSurveyAfterPurchase: boolean
    daysAfterPurchase: number
  }
  marketing: {
    allowEmailMarketing: boolean
    allowSmsMarketing: boolean
    defaultOptIn: boolean
  }
}

interface CustomerSettingsFormProps {
  settings: CustomerSettings
  onSave: (settings: CustomerSettings) => void
  isSaving: boolean
}

export default function CustomerSettingsForm({ settings, onSave, isSaving }: CustomerSettingsFormProps) {
  const [formState, setFormState] = useState<CustomerSettings>(settings)

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
        ...prev[section as keyof CustomerSettings],
        [field]: value,
      },
    }))
  }

  const handleDeepNestedChange = (section: string, subsection: string, field: string, value: any) => {
    setFormState((prev) => {
      const sectionData = prev[section as keyof CustomerSettings] as any
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [subsection]: {
            ...sectionData[subsection],
            [field]: value,
          },
        },
      }
    })
  }

  const handleAddLoyaltyTier = () => {
    const newTier: LoyaltyTier = {
      id: `tier-${Date.now()}`,
      name: "New Tier",
      minimumPoints: 0,
      discountPercentage: 0,
      pointsMultiplier: 1,
      enabled: true,
    }
    setFormState((prev) => ({
      ...prev,
      loyaltySettings: {
        ...prev.loyaltySettings,
        tiers: [...prev.loyaltySettings.tiers, newTier],
      },
    }))
  }

  const handleRemoveLoyaltyTier = (id: string) => {
    setFormState((prev) => ({
      ...prev,
      loyaltySettings: {
        ...prev.loyaltySettings,
        tiers: prev.loyaltySettings.tiers.filter((tier) => tier.id !== id),
      },
    }))
  }

  const handleUpdateLoyaltyTier = (id: string, field: string, value: any) => {
    setFormState((prev) => ({
      ...prev,
      loyaltySettings: {
        ...prev.loyaltySettings,
        tiers: prev.loyaltySettings.tiers.map((tier) =>
          tier.id === id
            ? {
                ...tier,
                [field]: value,
              }
            : tier,
        ),
      },
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formState)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Accordion type="single" collapsible defaultValue="customer-accounts">
        <AccordionItem value="customer-accounts">
          <AccordionTrigger>Customer Accounts</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-customer-accounts"
                  checked={formState.enableCustomerAccounts}
                  onCheckedChange={(checked) => handleChange("enableCustomerAccounts", checked)}
                />
                <Label htmlFor="enable-customer-accounts">Enable Customer Accounts</Label>
              </div>

              {formState.enableCustomerAccounts && (
                <>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="require-phone"
                      checked={formState.requirePhoneNumber}
                      onCheckedChange={(checked) => handleChange("requirePhoneNumber", checked)}
                    />
                    <Label htmlFor="require-phone">Require Phone Number</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="require-email"
                      checked={formState.requireEmail}
                      onCheckedChange={(checked) => handleChange("requireEmail", checked)}
                    />
                    <Label htmlFor="require-email">Require Email</Label>
                  </div>
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="loyalty-program">
          <AccordionTrigger>Loyalty Program</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-loyalty"
                  checked={formState.enableLoyaltyProgram}
                  onCheckedChange={(checked) => handleChange("enableLoyaltyProgram", checked)}
                />
                <Label htmlFor="enable-loyalty">Enable Loyalty Program</Label>
              </div>

              {formState.enableLoyaltyProgram && (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="points-per-currency">Points Per Currency Unit</Label>
                      <Input
                        id="points-per-currency"
                        type="number"
                        min="0"
                        step="0.1"
                        value={formState.loyaltySettings.pointsPerCurrency}
                        onChange={(e) =>
                          handleNestedChange("loyaltySettings", "pointsPerCurrency", Number(e.target.value))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="points-expiry">Points Expiry (Days)</Label>
                      <Input
                        id="points-expiry"
                        type="number"
                        min="0"
                        value={formState.loyaltySettings.pointsExpiryDays}
                        onChange={(e) =>
                          handleNestedChange("loyaltySettings", "pointsExpiryDays", Number(e.target.value))
                        }
                      />
                      <p className="text-xs text-muted-foreground">0 = Never Expire</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="min-redemption">Minimum Points for Redemption</Label>
                    <Input
                      id="min-redemption"
                      type="number"
                      min="0"
                      value={formState.loyaltySettings.minimumPointsRedemption}
                      onChange={(e) =>
                        handleNestedChange("loyaltySettings", "minimumPointsRedemption", Number(e.target.value))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Loyalty Tiers</Label>
                      <Button type="button" onClick={handleAddLoyaltyTier} variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Tier
                      </Button>
                    </div>

                    {formState.loyaltySettings.tiers.map((tier) => (
                      <Card key={tier.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="mb-4 flex items-center justify-between">
                            <h4 className="text-lg font-medium">{tier.name}</h4>
                            <Button
                              type="button"
                              onClick={() => handleRemoveLoyaltyTier(tier.id)}
                              variant="ghost"
                              size="sm"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor={`tier-name-${tier.id}`}>Tier Name</Label>
                              <Input
                                id={`tier-name-${tier.id}`}
                                value={tier.name}
                                onChange={(e) => handleUpdateLoyaltyTier(tier.id, "name", e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`min-points-${tier.id}`}>Minimum Points</Label>
                              <Input
                                id={`min-points-${tier.id}`}
                                type="number"
                                min="0"
                                value={tier.minimumPoints}
                                onChange={(e) =>
                                  handleUpdateLoyaltyTier(tier.id, "minimumPoints", Number(e.target.value))
                                }
                              />
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor={`discount-${tier.id}`}>Discount Percentage (%)</Label>
                              <Input
                                id={`discount-${tier.id}`}
                                type="number"
                                min="0"
                                max="100"
                                value={tier.discountPercentage}
                                onChange={(e) =>
                                  handleUpdateLoyaltyTier(tier.id, "discountPercentage", Number(e.target.value))
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`multiplier-${tier.id}`}>Points Multiplier</Label>
                              <Input
                                id={`multiplier-${tier.id}`}
                                type="number"
                                min="1"
                                step="0.1"
                                value={tier.pointsMultiplier}
                                onChange={(e) =>
                                  handleUpdateLoyaltyTier(tier.id, "pointsMultiplier", Number(e.target.value))
                                }
                              />
                            </div>
                          </div>

                          <div className="mt-4 flex items-center space-x-2">
                            <Switch
                              id={`tier-enabled-${tier.id}`}
                              checked={tier.enabled}
                              onCheckedChange={(checked) => handleUpdateLoyaltyTier(tier.id, "enabled", checked)}
                            />
                            <Label htmlFor={`tier-enabled-${tier.id}`}>Enabled</Label>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="customer-groups">
          <AccordionTrigger>Customer Groups</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-customer-groups"
                  checked={formState.customerGroups.enabled}
                  onCheckedChange={(checked) => handleNestedChange("customerGroups", "enabled", checked)}
                />
                <Label htmlFor="enable-customer-groups">Enable Customer Groups</Label>
              </div>

              {formState.customerGroups.enabled && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allow-custom-pricing"
                    checked={formState.customerGroups.allowCustomPricing}
                    onCheckedChange={(checked) => handleNestedChange("customerGroups", "allowCustomPricing", checked)}
                  />
                  <Label htmlFor="allow-custom-pricing">Allow Custom Pricing Per Group</Label>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="feedback">
          <AccordionTrigger>Customer Feedback</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="collect-feedback"
                  checked={formState.feedback.collectFeedback}
                  onCheckedChange={(checked) => handleNestedChange("feedback", "collectFeedback", checked)}
                />
                <Label htmlFor="collect-feedback">Collect Customer Feedback</Label>
              </div>

              {formState.feedback.collectFeedback && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="feedback-method">Feedback Collection Method</Label>
                    <Select
                      value={formState.feedback.feedbackMethod}
                      onValueChange={(value) => handleNestedChange("feedback", "feedbackMethod", value)}
                    >
                      <SelectTrigger id="feedback-method">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email Survey</SelectItem>
                        <SelectItem value="sms">SMS Survey</SelectItem>
                        <SelectItem value="receipt">Receipt QR Code</SelectItem>
                        <SelectItem value="pos">POS Screen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="send-survey"
                      checked={formState.feedback.sendSurveyAfterPurchase}
                      onCheckedChange={(checked) => handleNestedChange("feedback", "sendSurveyAfterPurchase", checked)}
                    />
                    <Label htmlFor="send-survey">Send Survey After Purchase</Label>
                  </div>

                  {formState.feedback.sendSurveyAfterPurchase && (
                    <div className="space-y-2">
                      <Label htmlFor="days-after">Days After Purchase</Label>
                      <Input
                        id="days-after"
                        type="number"
                        min="0"
                        value={formState.feedback.daysAfterPurchase}
                        onChange={(e) => handleNestedChange("feedback", "daysAfterPurchase", Number(e.target.value))}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="marketing">
          <AccordionTrigger>Marketing Preferences</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="allow-email-marketing"
                  checked={formState.marketing.allowEmailMarketing}
                  onCheckedChange={(checked) => handleNestedChange("marketing", "allowEmailMarketing", checked)}
                />
                <Label htmlFor="allow-email-marketing">Allow Email Marketing</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="allow-sms-marketing"
                  checked={formState.marketing.allowSmsMarketing}
                  onCheckedChange={(checked) => handleNestedChange("marketing", "allowSmsMarketing", checked)}
                />
                <Label htmlFor="allow-sms-marketing">Allow SMS Marketing</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="default-opt-in"
                  checked={formState.marketing.defaultOptIn}
                  onCheckedChange={(checked) => handleNestedChange("marketing", "defaultOptIn", checked)}
                />
                <Label htmlFor="default-opt-in">Default Opt-In for New Customers</Label>
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

