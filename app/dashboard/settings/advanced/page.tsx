"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getCurrentBusinessSettings, saveBusinessSettings } from "@/lib/services/settings-service"
import type { GlobalPOSSettings } from "@/lib/types/settings"

// Import settings section components
import GeneralSettingsForm from "@/components/settings/advanced/general-settings-form"
import POSTerminalSettingsForm from "@/components/settings/advanced/pos-terminal-settings-form"
import PaymentSettingsForm from "@/components/settings/advanced/payment-settings-form"
import InventorySettingsForm from "@/components/settings/advanced/inventory-settings-form"
import PricingSettingsForm from "@/components/settings/advanced/pricing-settings-form"
import CustomerSettingsForm from "@/components/settings/advanced/customer-settings-form"
import EmployeeSettingsForm from "@/components/settings/advanced/employee-settings-form"
import RestaurantSettingsForm from "@/components/settings/advanced/restaurant-settings-form"
import HotelSettingsForm from "@/components/settings/advanced/hotel-settings-form"
import RetailGrocerySettingsForm from "@/components/settings/advanced/retail-grocery-settings-form"
import TaxationSettingsForm from "@/components/settings/advanced/taxation-settings-form"
import ReportingSettingsForm from "@/components/settings/advanced/reporting-settings-form"
import IntegrationSettingsForm from "@/components/settings/advanced/integration-settings-form"
import SecuritySettingsForm from "@/components/settings/advanced/security-settings-form"

export default function AdvancedSettingsPage() {
  const [settings, setSettings] = useState<GlobalPOSSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const { toast } = useToast()

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true)
      try {
        const businessSettings = await getCurrentBusinessSettings()
        if (businessSettings) {
          setSettings(businessSettings)
        } else {
          toast({
            title: "Error",
            description: "Failed to load settings. Using default settings.",
            variant: "destructive",
          })
          // Set default settings here if needed
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error)
        toast({
          title: "Error",
          description: "Failed to load settings. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [toast])

  const handleSaveSettings = async (updatedSettings: GlobalPOSSettings) => {
    setIsSaving(true)
    try {
      // Save the updated settings
      const success = await saveBusinessSettings("business-1", updatedSettings) // Replace with actual business ID
      if (success) {
        setSettings(updatedSettings)
        toast({
          title: "Settings saved",
          description: "Your settings have been updated successfully.",
        })
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      console.error("Failed to save settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p className="text-lg text-muted-foreground">Settings not available.</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Advanced Settings</h1>
        <p className="text-muted-foreground">
          Configure detailed settings for your POS system. These settings control all aspects of your business
          operations.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="pos">POS Terminal</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="customer">Customer</TabsTrigger>
          <TabsTrigger value="employee">Employee</TabsTrigger>
          {settings.restaurant && <TabsTrigger value="restaurant">Restaurant</TabsTrigger>}
          {settings.hotel && <TabsTrigger value="hotel">Hotel</TabsTrigger>}
          {settings.retailGrocery && <TabsTrigger value="retail">Retail/Grocery</TabsTrigger>}
          <TabsTrigger value="taxation">Taxation</TabsTrigger>
          <TabsTrigger value="reporting">Reporting</TabsTrigger>
          <TabsTrigger value="integration">Integrations</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <CardTitle>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings</CardTitle>
            <CardDescription>Configure {activeTab} settings for your business.</CardDescription>
          </CardHeader>
          <CardContent>
            <TabsContent value="general" className="mt-0">
              <GeneralSettingsForm
                settings={settings.general}
                onSave={(generalSettings) => {
                  const updatedSettings = { ...settings, general: generalSettings }
                  handleSaveSettings(updatedSettings)
                }}
                isSaving={isSaving}
              />
            </TabsContent>

            <TabsContent value="pos" className="mt-0">
              <POSTerminalSettingsForm
                settings={settings.posTerminal}
                onSave={(posTerminalSettings) => {
                  const updatedSettings = { ...settings, posTerminal: posTerminalSettings }
                  handleSaveSettings(updatedSettings)
                }}
                isSaving={isSaving}
              />
            </TabsContent>

            <TabsContent value="payment" className="mt-0">
              <PaymentSettingsForm
                settings={settings.payment}
                onSave={(paymentSettings) => {
                  const updatedSettings = { ...settings, payment: paymentSettings }
                  handleSaveSettings(updatedSettings)
                }}
                isSaving={isSaving}
              />
            </TabsContent>

            <TabsContent value="inventory" className="mt-0">
              <InventorySettingsForm
                settings={settings.inventory}
                onSave={(inventorySettings) => {
                  const updatedSettings = { ...settings, inventory: inventorySettings }
                  handleSaveSettings(updatedSettings)
                }}
                isSaving={isSaving}
              />
            </TabsContent>

            <TabsContent value="pricing" className="mt-0">
              <PricingSettingsForm
                settings={settings.pricing}
                onSave={(pricingSettings) => {
                  const updatedSettings = { ...settings, pricing: pricingSettings }
                  handleSaveSettings(updatedSettings)
                }}
                isSaving={isSaving}
              />
            </TabsContent>

            <TabsContent value="customer" className="mt-0">
              <CustomerSettingsForm
                settings={settings.customer}
                onSave={(customerSettings) => {
                  const updatedSettings = { ...settings, customer: customerSettings }
                  handleSaveSettings(updatedSettings)
                }}
                isSaving={isSaving}
              />
            </TabsContent>

            <TabsContent value="employee" className="mt-0">
              <EmployeeSettingsForm
                settings={settings.employee}
                onSave={(employeeSettings) => {
                  const updatedSettings = { ...settings, employee: employeeSettings }
                  handleSaveSettings(updatedSettings)
                }}
                isSaving={isSaving}
              />
            </TabsContent>

            {settings.restaurant && (
              <TabsContent value="restaurant" className="mt-0">
                <RestaurantSettingsForm
                  settings={settings.restaurant}
                  onSave={(restaurantSettings) => {
                    const updatedSettings = { ...settings, restaurant: restaurantSettings }
                    handleSaveSettings(updatedSettings)
                  }}
                  isSaving={isSaving}
                />
              </TabsContent>
            )}

            {settings.hotel && (
              <TabsContent value="hotel" className="mt-0">
                <HotelSettingsForm
                  settings={settings.hotel}
                  onSave={(hotelSettings) => {
                    const updatedSettings = { ...settings, hotel: hotelSettings }
                    handleSaveSettings(updatedSettings)
                  }}
                  isSaving={isSaving}
                />
              </TabsContent>
            )}

            {settings.retailGrocery && (
              <TabsContent value="retail" className="mt-0">
                <RetailGrocerySettingsForm
                  settings={settings.retailGrocery}
                  onSave={(retailGrocerySettings) => {
                    const updatedSettings = { ...settings, retailGrocery: retailGrocerySettings }
                    handleSaveSettings(updatedSettings)
                  }}
                  isSaving={isSaving}
                />
              </TabsContent>
            )}

            <TabsContent value="taxation" className="mt-0">
              <TaxationSettingsForm
                settings={settings.taxation}
                onSave={(taxationSettings) => {
                  const updatedSettings = { ...settings, taxation: taxationSettings }
                  handleSaveSettings(updatedSettings)
                }}
                isSaving={isSaving}
              />
            </TabsContent>

            <TabsContent value="reporting" className="mt-0">
              <ReportingSettingsForm
                settings={settings.reporting}
                onSave={(reportingSettings) => {
                  const updatedSettings = { ...settings, reporting: reportingSettings }
                  handleSaveSettings(updatedSettings)
                }}
                isSaving={isSaving}
              />
            </TabsContent>

            <TabsContent value="integration" className="mt-0">
              <IntegrationSettingsForm
                settings={settings.integration}
                onSave={(integrationSettings) => {
                  const updatedSettings = { ...settings, integration: integrationSettings }
                  handleSaveSettings(updatedSettings)
                }}
                isSaving={isSaving}
              />
            </TabsContent>

            <TabsContent value="security" className="mt-0">
              <SecuritySettingsForm
                settings={settings.security}
                onSave={(securitySettings) => {
                  const updatedSettings = { ...settings, security: securitySettings }
                  handleSaveSettings(updatedSettings)
                }}
                isSaving={isSaving}
              />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}

