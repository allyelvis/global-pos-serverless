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

interface PaymentMethod {
  id: string
  name: string
  type: string
  enabled: boolean
  processingFee: number
  defaultForCheckout: boolean
}

interface PaymentGateway {
  id: string
  name: string
  enabled: boolean
  apiKey: string
  secretKey: string
}

interface PaymentSettings {
  methods: PaymentMethod[]
  gateways: PaymentGateway[]
  autoCapture: boolean
  requireSignature: boolean
  signatureThreshold: number
  allowPartialPayments: boolean
  allowSplitPayments: boolean
  allowRefunds: boolean
  refundPeriod: number
  receiptOptions: {
    emailReceipt: boolean
    printReceipt: boolean
    smsReceipt: boolean
  }
}

interface PaymentSettingsFormProps {
  settings: PaymentSettings
  onSave: (settings: PaymentSettings) => void
  isSaving: boolean
}

export default function PaymentSettingsForm({ settings, onSave, isSaving }: PaymentSettingsFormProps) {
  const [formState, setFormState] = useState<PaymentSettings>(settings)

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
        ...prev[section as keyof PaymentSettings],
        [field]: value,
      },
    }))
  }

  const handleAddPaymentMethod = () => {
    const newMethod: PaymentMethod = {
      id: `method-${Date.now()}`,
      name: "New Payment Method",
      type: "card",
      enabled: true,
      processingFee: 0,
      defaultForCheckout: false,
    }
    setFormState((prev) => ({
      ...prev,
      methods: [...prev.methods, newMethod],
    }))
  }

  const handleRemovePaymentMethod = (id: string) => {
    setFormState((prev) => ({
      ...prev,
      methods: prev.methods.filter((method) => method.id !== id),
    }))
  }

  const handleUpdatePaymentMethod = (id: string, field: string, value: any) => {
    setFormState((prev) => ({
      ...prev,
      methods: prev.methods.map((method) =>
        method.id === id
          ? {
              ...method,
              [field]: value,
            }
          : method,
      ),
    }))
  }

  const handleAddPaymentGateway = () => {
    const newGateway: PaymentGateway = {
      id: `gateway-${Date.now()}`,
      name: "New Payment Gateway",
      enabled: true,
      apiKey: "",
      secretKey: "",
    }
    setFormState((prev) => ({
      ...prev,
      gateways: [...prev.gateways, newGateway],
    }))
  }

  const handleRemovePaymentGateway = (id: string) => {
    setFormState((prev) => ({
      ...prev,
      gateways: prev.gateways.filter((gateway) => gateway.id !== id),
    }))
  }

  const handleUpdatePaymentGateway = (id: string, field: string, value: any) => {
    setFormState((prev) => ({
      ...prev,
      gateways: prev.gateways.map((gateway) =>
        gateway.id === id
          ? {
              ...gateway,
              [field]: value,
            }
          : gateway,
      ),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formState)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Accordion type="single" collapsible defaultValue="payment-methods">
        <AccordionItem value="payment-methods">
          <AccordionTrigger>Payment Methods</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button type="button" onClick={handleAddPaymentMethod} variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Payment Method
                </Button>
              </div>

              {formState.methods.map((method) => (
                <Card key={method.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-lg font-medium">{method.name}</h4>
                      <Button
                        type="button"
                        onClick={() => handleRemovePaymentMethod(method.id)}
                        variant="ghost"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`method-name-${method.id}`}>Method Name</Label>
                        <Input
                          id={`method-name-${method.id}`}
                          value={method.name}
                          onChange={(e) => handleUpdatePaymentMethod(method.id, "name", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`method-type-${method.id}`}>Method Type</Label>
                        <Select
                          value={method.type}
                          onValueChange={(value) => handleUpdatePaymentMethod(method.id, "type", value)}
                        >
                          <SelectTrigger id={`method-type-${method.id}`}>
                            <SelectValue placeholder="Select method type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="card">Credit/Debit Card</SelectItem>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="bank">Bank Transfer</SelectItem>
                            <SelectItem value="mobile">Mobile Payment</SelectItem>
                            <SelectItem value="crypto">Cryptocurrency</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`processing-fee-${method.id}`}>Processing Fee (%)</Label>
                        <Input
                          id={`processing-fee-${method.id}`}
                          type="number"
                          step="0.01"
                          min="0"
                          value={method.processingFee}
                          onChange={(e) =>
                            handleUpdatePaymentMethod(method.id, "processingFee", Number(e.target.value))
                          }
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`method-enabled-${method.id}`}
                          checked={method.enabled}
                          onCheckedChange={(checked) => handleUpdatePaymentMethod(method.id, "enabled", checked)}
                        />
                        <Label htmlFor={`method-enabled-${method.id}`}>Enabled</Label>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center space-x-2">
                      <Switch
                        id={`default-checkout-${method.id}`}
                        checked={method.defaultForCheckout}
                        onCheckedChange={(checked) => {
                          // If setting this method as default, unset others
                          if (checked) {
                            setFormState((prev) => ({
                              ...prev,
                              methods: prev.methods.map((m) => ({
                                ...m,
                                defaultForCheckout: m.id === method.id,
                              })),
                            }))
                          } else {
                            handleUpdatePaymentMethod(method.id, "defaultForCheckout", false)
                          }
                        }}
                      />
                      <Label htmlFor={`default-checkout-${method.id}`}>Default for Checkout</Label>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="payment-gateways">
          <AccordionTrigger>Payment Gateways</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button type="button" onClick={handleAddPaymentGateway} variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Payment Gateway
                </Button>
              </div>

              {formState.gateways.map((gateway) => (
                <Card key={gateway.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-lg font-medium">{gateway.name}</h4>
                      <Button
                        type="button"
                        onClick={() => handleRemovePaymentGateway(gateway.id)}
                        variant="ghost"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`gateway-name-${gateway.id}`}>Gateway Name</Label>
                        <Input
                          id={`gateway-name-${gateway.id}`}
                          value={gateway.name}
                          onChange={(e) => handleUpdatePaymentGateway(gateway.id, "name", e.target.value)}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`gateway-enabled-${gateway.id}`}
                          checked={gateway.enabled}
                          onCheckedChange={(checked) => handleUpdatePaymentGateway(gateway.id, "enabled", checked)}
                        />
                        <Label htmlFor={`gateway-enabled-${gateway.id}`}>Enabled</Label>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`api-key-${gateway.id}`}>API Key</Label>
                        <Input
                          id={`api-key-${gateway.id}`}
                          type="password"
                          value={gateway.apiKey}
                          onChange={(e) => handleUpdatePaymentGateway(gateway.id, "apiKey", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`secret-key-${gateway.id}`}>Secret Key</Label>
                        <Input
                          id={`secret-key-${gateway.id}`}
                          type="password"
                          value={gateway.secretKey}
                          onChange={(e) => handleUpdatePaymentGateway(gateway.id, "secretKey", e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="payment-options">
          <AccordionTrigger>Payment Options</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-capture"
                    checked={formState.autoCapture}
                    onCheckedChange={(checked) => handleChange("autoCapture", checked)}
                  />
                  <Label htmlFor="auto-capture">Auto-Capture Payments</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="require-signature"
                    checked={formState.requireSignature}
                    onCheckedChange={(checked) => handleChange("requireSignature", checked)}
                  />
                  <Label htmlFor="require-signature">Require Signature</Label>
                </div>
              </div>

              {formState.requireSignature && (
                <div className="space-y-2">
                  <Label htmlFor="signature-threshold">Signature Threshold Amount</Label>
                  <Input
                    id="signature-threshold"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formState.signatureThreshold}
                    onChange={(e) => handleChange("signatureThreshold", Number(e.target.value))}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allow-partial"
                    checked={formState.allowPartialPayments}
                    onCheckedChange={(checked) => handleChange("allowPartialPayments", checked)}
                  />
                  <Label htmlFor="allow-partial">Allow Partial Payments</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allow-split"
                    checked={formState.allowSplitPayments}
                    onCheckedChange={(checked) => handleChange("allowSplitPayments", checked)}
                  />
                  <Label htmlFor="allow-split">Allow Split Payments</Label>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allow-refunds"
                    checked={formState.allowRefunds}
                    onCheckedChange={(checked) => handleChange("allowRefunds", checked)}
                  />
                  <Label htmlFor="allow-refunds">Allow Refunds</Label>
                </div>
                {formState.allowRefunds && (
                  <div className="space-y-2">
                    <Label htmlFor="refund-period">Refund Period (days)</Label>
                    <Input
                      id="refund-period"
                      type="number"
                      min="1"
                      value={formState.refundPeriod}
                      onChange={(e) => handleChange("refundPeriod", Number(e.target.value))}
                    />
                  </div>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="receipt-options">
          <AccordionTrigger>Receipt Options</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="email-receipt"
                    checked={formState.receiptOptions.emailReceipt}
                    onCheckedChange={(checked) => handleNestedChange("receiptOptions", "emailReceipt", checked)}
                  />
                  <Label htmlFor="email-receipt">Email Receipt</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="print-receipt"
                    checked={formState.receiptOptions.printReceipt}
                    onCheckedChange={(checked) => handleNestedChange("receiptOptions", "printReceipt", checked)}
                  />
                  <Label htmlFor="print-receipt">Print Receipt</Label>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="sms-receipt"
                  checked={formState.receiptOptions.smsReceipt}
                  onCheckedChange={(checked) => handleNestedChange("receiptOptions", "smsReceipt", checked)}
                />
                <Label htmlFor="sms-receipt">SMS Receipt</Label>
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

