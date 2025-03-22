"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface IntegrationConfig {
  id: string
  name: string
  enabled: boolean
  apiKey: string
  apiSecret: string
  apiUrl: string
  syncFrequency: number
  lastSynced: string | null
}

interface IntegrationSettings {
  paymentGateways: {
    enablePaymentGateways: boolean
    gateways: IntegrationConfig[]
  }
  ecommerce: {
    enableEcommerce: boolean
    platforms: IntegrationConfig[]
  }
  accounting: {
    enableAccounting: boolean
    systems: IntegrationConfig[]
  }
  shipping: {
    enableShipping: boolean
    providers: IntegrationConfig[]
  }
  marketing: {
    enableMarketing: boolean
    platforms: IntegrationConfig[]
  }
  apiSettings: {
    enablePublicAPI: boolean
    requireAuthentication: boolean
    rateLimitRequests: number
    webhookURL: string
  }
}

interface IntegrationSettingsFormProps {
  settings: IntegrationSettings
  onSave: (settings: IntegrationSettings) => void
  isSaving: boolean
}

export default function IntegrationSettingsForm({ settings, onSave, isSaving }: IntegrationSettingsFormProps) {
  const [formState, setFormState] = useState<IntegrationSettings>(settings)
  const [activeTab, setActiveTab] = useState<string>("payment-gateways")

  const handleNestedChange = (section: string, field: string, value: any) => {
    setFormState((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof IntegrationSettings],
        [field]: value,
      },
    }))
  }

  const handleDeepNestedChange = (section: string, subsection: string, field: string, value: any) => {
    setFormState((prev) => {
      const sectionData = prev[section as keyof IntegrationSettings] as any
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

  const handleAddIntegration = (section: string, listField: string) => {
    const newIntegration: IntegrationConfig = {
      id: `integration-${Date.now()}`,
      name: "New Integration",
      enabled: true,
      apiKey: "",
      apiSecret: "",
      apiUrl: "",
      syncFrequency: 60,
      lastSynced: null,
    }

    setFormState((prev) => {
      const sectionData = prev[section as keyof IntegrationSettings] as any
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [listField]: [...sectionData[listField], newIntegration],
        },
      }
    })
  }

  const handleRemoveIntegration = (section: string, listField: string, id: string) => {
    setFormState((prev) => {
      const sectionData = prev[section as keyof IntegrationSettings] as any
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [listField]: sectionData[listField].filter((item: IntegrationConfig) => item.id !== id),
        },
      }
    })
  }

  const handleUpdateIntegration = (section: string, listField: string, id: string, field: string, value: any) => {
    setFormState((prev) => {
      const sectionData = prev[section as keyof IntegrationSettings] as any
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [listField]: sectionData[listField].map((item: IntegrationConfig) =>
            item.id === id
              ? {
                  ...item,
                  [field]: value,
                }
              : item,
          ),
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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="payment-gateways">Payment</TabsTrigger>
          <TabsTrigger value="ecommerce">Ecommerce</TabsTrigger>
          <TabsTrigger value="accounting">Accounting</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="api-settings">API</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="payment-gateways">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enable-payment-gateways"
                      checked={formState.paymentGateways.enablePaymentGateways}
                      onCheckedChange={(checked) =>
                        handleNestedChange("paymentGateways", "enablePaymentGateways", checked)
                      }
                    />
                    <Label htmlFor="enable-payment-gateways">Enable Payment Gateways</Label>
                  </div>

                  {formState.paymentGateways.enablePaymentGateways && (
                    <>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          onClick={() => handleAddIntegration("paymentGateways", "gateways")}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Payment Gateway
                        </Button>
                      </div>

                      {formState.paymentGateways.gateways.map((gateway) => (
                        <Card key={gateway.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="mb-4 flex items-center justify-between">
                              <h4 className="text-lg font-medium">{gateway.name}</h4>
                              <Button
                                type="button"
                                onClick={() => handleRemoveIntegration("paymentGateways", "gateways", gateway.id)}
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
                                  onChange={(e) =>
                                    handleUpdateIntegration(
                                      "paymentGateways",
                                      "gateways",
                                      gateway.id,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`gateway-url-${gateway.id}`}>API URL</Label>
                                <Input
                                  id={`gateway-url-${gateway.id}`}
                                  value={gateway.apiUrl}
                                  onChange={(e) =>
                                    handleUpdateIntegration(
                                      "paymentGateways",
                                      "gateways",
                                      gateway.id,
                                      "apiUrl",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor={`gateway-key-${gateway.id}`}>API Key</Label>
                                <Input
                                  id={`gateway-key-${gateway.id}`}
                                  type="password"
                                  value={gateway.apiKey}
                                  onChange={(e) =>
                                    handleUpdateIntegration(
                                      "paymentGateways",
                                      "gateways",
                                      gateway.id,
                                      "apiKey",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`gateway-secret-${gateway.id}`}>API Secret</Label>
                                <Input
                                  id={`gateway-secret-${gateway.id}`}
                                  type="password"
                                  value={gateway.apiSecret}
                                  onChange={(e) =>
                                    handleUpdateIntegration(
                                      "paymentGateways",
                                      "gateways",
                                      gateway.id,
                                      "apiSecret",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor={`gateway-sync-${gateway.id}`}>Sync Frequency (minutes)</Label>
                                <Input
                                  id={`gateway-sync-${gateway.id}`}
                                  type="number"
                                  min="5"
                                  value={gateway.syncFrequency}
                                  onChange={(e) =>
                                    handleUpdateIntegration(
                                      "paymentGateways",
                                      "gateways",
                                      gateway.id,
                                      "syncFrequency",
                                      Number(e.target.value),
                                    )
                                  }
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`gateway-enabled-${gateway.id}`}
                                  checked={gateway.enabled}
                                  onCheckedChange={(checked) =>
                                    handleUpdateIntegration(
                                      "paymentGateways",
                                      "gateways",
                                      gateway.id,
                                      "enabled",
                                      checked,
                                    )
                                  }
                                />
                                <Label htmlFor={`gateway-enabled-${gateway.id}`}>Enabled</Label>
                              </div>
                            </div>

                            {gateway.lastSynced && (
                              <div className="mt-4 text-sm text-muted-foreground">
                                Last synced: {new Date(gateway.lastSynced).toLocaleString()}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ecommerce">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enable-ecommerce"
                      checked={formState.ecommerce.enableEcommerce}
                      onCheckedChange={(checked) => handleNestedChange("ecommerce", "enableEcommerce", checked)}
                    />
                    <Label htmlFor="enable-ecommerce">Enable Ecommerce Integrations</Label>
                  </div>

                  {formState.ecommerce.enableEcommerce && (
                    <>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          onClick={() => handleAddIntegration("ecommerce", "platforms")}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Ecommerce Platform
                        </Button>
                      </div>

                      {formState.ecommerce.platforms.map((platform) => (
                        <Card key={platform.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="mb-4 flex items-center justify-between">
                              <h4 className="text-lg font-medium">{platform.name}</h4>
                              <Button
                                type="button"
                                onClick={() => handleRemoveIntegration("ecommerce", "platforms", platform.id)}
                                variant="ghost"
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor={`platform-name-${platform.id}`}>Platform Name</Label>
                                <Input
                                  id={`platform-name-${platform.id}`}
                                  value={platform.name}
                                  onChange={(e) =>
                                    handleUpdateIntegration(
                                      "ecommerce",
                                      "platforms",
                                      platform.id,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`platform-url-${platform.id}`}>API URL</Label>
                                <Input
                                  id={`platform-url-${platform.id}`}
                                  value={platform.apiUrl}
                                  onChange={(e) =>
                                    handleUpdateIntegration(
                                      "ecommerce",
                                      "platforms",
                                      platform.id,
                                      "apiUrl",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor={`platform-key-${platform.id}`}>API Key</Label>
                                <Input
                                  id={`platform-key-${platform.id}`}
                                  type="password"
                                  value={platform.apiKey}
                                  onChange={(e) =>
                                    handleUpdateIntegration(
                                      "ecommerce",
                                      "platforms",
                                      platform.id,
                                      "apiKey",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`platform-secret-${platform.id}`}>API Secret</Label>
                                <Input
                                  id={`platform-secret-${platform.id}`}
                                  type="password"
                                  value={platform.apiSecret}
                                  onChange={(e) =>
                                    handleUpdateIntegration(
                                      "ecommerce",
                                      "platforms",
                                      platform.id,
                                      "apiSecret",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor={`platform-sync-${platform.id}`}>Sync Frequency (minutes)</Label>
                                <Input
                                  id={`platform-sync-${platform.id}`}
                                  type="number"
                                  min="5"
                                  value={platform.syncFrequency}
                                  onChange={(e) =>
                                    handleUpdateIntegration(
                                      "ecommerce",
                                      "platforms",
                                      platform.id,
                                      "syncFrequency",
                                      Number(e.target.value),
                                    )
                                  }
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`platform-enabled-${platform.id}`}
                                  checked={platform.enabled}
                                  onCheckedChange={(checked) =>
                                    handleUpdateIntegration("ecommerce", "platforms", platform.id, "enabled", checked)
                                  }
                                />
                                <Label htmlFor={`platform-enabled-${platform.id}`}>Enabled</Label>
                              </div>
                            </div>

                            {platform.lastSynced && (
                              <div className="mt-4 text-sm text-muted-foreground">
                                Last synced: {new Date(platform.lastSynced).toLocaleString()}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounting">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enable-accounting"
                      checked={formState.accounting.enableAccounting}
                      onCheckedChange={(checked) => handleNestedChange("accounting", "enableAccounting", checked)}
                    />
                    <Label htmlFor="enable-accounting">Enable Accounting Integrations</Label>
                  </div>

                  {formState.accounting.enableAccounting && (
                    <>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          onClick={() => handleAddIntegration("accounting", "systems")}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Accounting System
                        </Button>
                      </div>

                      {formState.accounting.systems.map((system) => (
                        <Card key={system.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="mb-4 flex items-center justify-between">
                              <h4 className="text-lg font-medium">{system.name}</h4>
                              <Button
                                type="button"
                                onClick={() => handleRemoveIntegration("accounting", "systems", system.id)}
                                variant="ghost"
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor={`system-name-${system.id}`}>System Name</Label>
                                <Input
                                  id={`system-name-${system.id}`}
                                  value={system.name}
                                  onChange={(e) =>
                                    handleUpdateIntegration("accounting", "systems", system.id, "name", e.target.value)
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`system-url-${system.id}`}>API URL</Label>
                                <Input
                                  id={`system-url-${system.id}`}
                                  value={system.apiUrl}
                                  onChange={(e) =>
                                    handleUpdateIntegration(
                                      "accounting",
                                      "systems",
                                      system.id,
                                      "apiUrl",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor={`system-key-${system.id}`}>API Key</Label>
                                <Input
                                  id={`system-key-${system.id}`}
                                  type="password"
                                  value={system.apiKey}
                                  onChange={(e) =>
                                    handleUpdateIntegration(
                                      "accounting",
                                      "systems",
                                      system.id,
                                      "apiKey",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`system-secret-${system.id}`}>API Secret</Label>
                                <Input
                                  id={`system-secret-${system.id}`}
                                  type="password"
                                  value={system.apiSecret}
                                  onChange={(e) =>
                                    handleUpdateIntegration(
                                      "accounting",
                                      "systems",
                                      system.id,
                                      "apiSecret",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor={`system-sync-${system.id}`}>Sync Frequency (minutes)</Label>
                                <Input
                                  id={`system-sync-${system.id}`}
                                  type="number"
                                  min="5"
                                  value={system.syncFrequency}
                                  onChange={(e) =>
                                    handleUpdateIntegration(
                                      "accounting",
                                      "systems",
                                      system.id,
                                      "syncFrequency",
                                      Number(e.target.value),
                                    )
                                  }
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`system-enabled-${system.id}`}
                                  checked={system.enabled}
                                  onCheckedChange={(checked) =>
                                    handleUpdateIntegration("accounting", "systems", system.id, "enabled", checked)
                                  }
                                />
                                <Label htmlFor={`system-enabled-${system.id}`}>Enabled</Label>
                              </div>
                            </div>

                            {system.lastSynced && (
                              <div className="mt-4 text-sm text-muted-foreground">
                                Last synced: {new Date(system.lastSynced).toLocaleString()}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shipping">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enable-shipping"
                      checked={formState.shipping.enableShipping}
                      onCheckedChange={(checked) => handleNestedChange("shipping", "enableShipping", checked)}
                    />
                    <Label htmlFor="enable-shipping">Enable Shipping Integrations</Label>
                  </div>

                  {formState.shipping.enableShipping && (
                    <>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          onClick={() => handleAddIntegration("shipping", "providers")}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Shipping Provider
                        </Button>
                      </div>

                      {formState.shipping.providers.map((provider) => (
                        <Card key={provider.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="mb-4 flex items-center justify-between">
                              <h4 className="text-lg font-medium">{provider.name}</h4>
                              <Button
                                type="button"
                                onClick={() => handleRemoveIntegration("shipping", "providers", provider.id)}
                                variant="ghost"
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor={`provider-name-${provider.id}`}>Provider Name</Label>
                                <Input
                                  id={`provider-name-${provider.id}`}
                                  value={provider.name}
                                  onChange={(e) =>
                                    handleUpdateIntegration(
                                      "shipping",
                                      "providers",
                                      provider.id,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`provider-url-${provider.id}`}>API URL</Label>
                                <Input
                                  id={`provider-url-${provider.id}`}
                                  value={provider.apiUrl}
                                  onChange={(e) =>
                                    handleUpdateIntegration(
                                      "shipping",
                                      "providers",
                                      provider.id,
                                      "apiUrl",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor={`provider-key-${provider.id}`}>API Key</Label>
                                <Input
                                  id={`provider-key-${provider.id}`}
                                  type="password"
                                  value={provider.apiKey}
                                  onChange={(e) =>
                                    handleUpdateIntegration(
                                      "shipping",
                                      "providers",
                                      provider.id,
                                      "apiKey",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`provider-secret-${provider.id}`}>API Secret</Label>
                                <Input
                                  id={`provider-secret-${provider.id}`}
                                  type="password"
                                  value={provider.apiSecret}
                                  onChange={(e) =>
                                    handleUpdateIntegration(
                                      "shipping",
                                      "providers",
                                      provider.id,
                                      "apiSecret",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor={`provider-sync-${provider.id}`}>Sync Frequency (minutes)</Label>
                                <Input
                                  id={`provider-sync-${provider.id}`}
                                  type="number"
                                  min="5"
                                  value={provider.syncFrequency}
                                  onChange={(e) =>
                                    handleUpdateIntegration(
                                      "shipping",
                                      "providers",
                                      provider.id,
                                      "syncFrequency",
                                      Number(e.target.value),
                                    )
                                  }
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`provider-enabled-${provider.id}`}
                                  checked={provider.enabled}
                                  onCheckedChange={(checked) =>
                                    handleUpdateIntegration("shipping", "providers", provider.id, "enabled", checked)
                                  }
                                />
                                <Label htmlFor={`provider-enabled-${provider.id}`}>Enabled</Label>
                              </div>
                            </div>

                            {provider.lastSynced && (
                              <div className="mt-4 text-sm text-muted-foreground">
                                Last synced: {new Date(provider.lastSynced).toLocaleString()}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="marketing">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enable-marketing"
                      checked={formState.marketing.enableMarketing}
                      onCheckedChange={(checked) => handleNestedChange("marketing", "enableMarketing", checked)}
                    />
                    <Label htmlFor="enable-marketing">Enable Marketing Integrations</Label>
                  </div>

                  {formState.marketing.enableMarketing && (
                    <>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          onClick={() => handleAddIntegration("marketing", "platforms")}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Marketing Platform
                        </Button>
                      </div>

                      {formState.marketing.platforms.map((platform) => (
                        <Card key={platform.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="mb-4 flex items-center justify-between">
                              <h4 className="text-lg font-medium">{platform.name}</h4>
                              <Button
                                type="button"
                                onClick={() => handleRemoveIntegration("marketing", "platforms", platform.id)}
                                variant="ghost"
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor={`marketing-name-${platform.id}`}>Platform Name</Label>
                                <Input
                                  id={`marketing-name-${platform.id}`}
                                  value={platform.name}
                                  onChange={(e) =>
                                    handleUpdateIntegration(
                                      "marketing",
                                      "platforms",
                                      platform.id,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`marketing-url-${platform.id}`}>API URL</Label>
                                <Input
                                  id={`marketing-url-${platform.id}`}
                                  value={platform.apiUrl}
                                  onChange={(e) =>
                                    handleUpdateIntegration(
                                      "marketing",
                                      "platforms",
                                      platform.id,
                                      "apiUrl",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor={`marketing-key-${platform.id}`}>API Key</Label>
                                <Input
                                  id={`marketing-key-${platform.id}`}
                                  type="password"
                                  value={platform.apiKey}
                                  onChange={(e) =>
                                    handleUpdateIntegration(
                                      "marketing",
                                      "platforms",
                                      platform.id,
                                      "apiKey",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`marketing-secret-${platform.id}`}>API Secret</Label>
                                <Input
                                  id={`marketing-secret-${platform.id}`}
                                  type="password"
                                  value={platform.apiSecret}
                                  onChange={(e) =>
                                    handleUpdateIntegration(
                                      "marketing",
                                      "platforms",
                                      platform.id,
                                      "apiSecret",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor={`marketing-sync-${platform.id}`}>Sync Frequency (minutes)</Label>
                                <Input
                                  id={`marketing-sync-${platform.id}`}
                                  type="number"
                                  min="5"
                                  value={platform.syncFrequency}
                                  onChange={(e) =>
                                    handleUpdateIntegration(
                                      "marketing",
                                      "platforms",
                                      platform.id,
                                      "syncFrequency",
                                      Number(e.target.value),
                                    )
                                  }
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`marketing-enabled-${platform.id}`}
                                  checked={platform.enabled}
                                  onCheckedChange={(checked) =>
                                    handleUpdateIntegration("marketing", "platforms", platform.id, "enabled", checked)
                                  }
                                />
                                <Label htmlFor={`marketing-enabled-${platform.id}`}>Enabled</Label>
                              </div>
                            </div>

                            {platform.lastSynced && (
                              <div className="mt-4 text-sm text-muted-foreground">
                                Last synced: {new Date(platform.lastSynced).toLocaleString()}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api-settings">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enable-public-api"
                      checked={formState.apiSettings.enablePublicAPI}
                      onCheckedChange={(checked) => handleNestedChange("apiSettings", "enablePublicAPI", checked)}
                    />
                    <Label htmlFor="enable-public-api">Enable Public API</Label>
                  </div>

                  {formState.apiSettings.enablePublicAPI && (
                    <>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="require-authentication"
                          checked={formState.apiSettings.requireAuthentication}
                          onCheckedChange={(checked) =>
                            handleNestedChange("apiSettings", "requireAuthentication", checked)
                          }
                        />
                        <Label htmlFor="require-authentication">Require Authentication</Label>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rate-limit">Rate Limit (requests per minute)</Label>
                        <Input
                          id="rate-limit"
                          type="number"
                          min="1"
                          value={formState.apiSettings.rateLimitRequests}
                          onChange={(e) =>
                            handleNestedChange("apiSettings", "rateLimitRequests", Number(e.target.value))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="webhook-url">Webhook URL</Label>
                        <Input
                          id="webhook-url"
                          value={formState.apiSettings.webhookURL}
                          onChange={(e) => handleNestedChange("apiSettings", "webhookURL", e.target.value)}
                          placeholder="https://your-webhook-endpoint.com"
                        />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

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

