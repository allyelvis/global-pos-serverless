"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getBusinessById, updateBusiness } from "@/lib/db/business"
import { getCurrentUser } from "@/lib/db/users"
import { currencies } from "@/lib/currency"
import { Loader2 } from "lucide-react"
import { VercelIntegrationSettings } from "@/components/settings/vercel-integration-settings"
import { LocationManagement } from "@/components/settings/location-management"
import { UserRoleManagement } from "@/components/settings/user-role-management"

export default function SettingsPage() {
  const [businessSettings, setBusinessSettings] = useState({
    name: "My Business",
    type: "retail",
    address: "123 Main St, Anytown, USA",
    phone: "(555) 123-4567",
    email: "info@mybusiness.com",
    taxRate: "8.5",
    currency: "USD",
    timeZone: "America/New_York",
    receiptFooter: "Thank you for your business!",
  })

  const [systemSettings, setSystemSettings] = useState({
    theme: "system",
    language: "en",
    autoLogout: "30",
    enableOfflineMode: true,
    enableInventoryAlerts: true,
    enableCustomerLoyalty: true,
    enableEmailReceipts: true,
    enableSMSNotifications: false,
    enableAIRecommendations: false,
    enableMultiLanguage: false,
    enableCryptocurrencyPayments: false,
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true)
      try {
        const user = await getCurrentUser()
        if (user) {
          const business = await getBusinessById(user.businessId)
          if (business) {
            setBusinessSettings({
              name: business.name,
              type: business.type,
              address: business.address,
              phone: business.phone,
              email: business.email,
              taxRate: business.taxRate.toString(),
              currency: business.currency,
              timeZone: business.timeZone,
              receiptFooter: "Thank you for your business!",
            })
          }
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

  const handleBusinessSettingChange = (field: string, value: string | boolean) => {
    setBusinessSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSystemSettingChange = (field: string, value: string | boolean) => {
    setSystemSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaveBusinessSettings = async () => {
    setIsSaving(true)
    try {
      const user = await getCurrentUser()
      if (user) {
        const updatedBusiness = await updateBusiness(user.businessId, {
          name: businessSettings.name,
          type: businessSettings.type as any,
          address: businessSettings.address,
          phone: businessSettings.phone,
          email: businessSettings.email,
          taxRate: Number.parseFloat(businessSettings.taxRate),
          currency: businessSettings.currency,
          timeZone: businessSettings.timeZone,
        })

        if (updatedBusiness) {
          toast({
            title: "Settings saved",
            description: "Your business settings have been updated successfully.",
          })
        } else {
          throw new Error("Failed to update business settings")
        }
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your POS system settings and preferences.</p>
      </div>

      <Tabs defaultValue="business" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="localization">Localization</TabsTrigger>
          <TabsTrigger value="vercel">Vercel</TabsTrigger>
        </TabsList>
        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Update your business details and settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={businessSettings.name}
                    onChange={(e) => handleBusinessSettingChange("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select
                    value={businessSettings.type}
                    onValueChange={(value) => handleBusinessSettingChange("type", value)}
                  >
                    <SelectTrigger id="businessType">
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="hotel">Hotel</SelectItem>
                      <SelectItem value="grocery">Grocery</SelectItem>
                      <SelectItem value="salon">Salon</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={businessSettings.address}
                  onChange={(e) => handleBusinessSettingChange("address", e.target.value)}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={businessSettings.phone}
                    onChange={(e) => handleBusinessSettingChange("phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={businessSettings.email}
                    onChange={(e) => handleBusinessSettingChange("email", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={businessSettings.taxRate}
                    onChange={(e) => handleBusinessSettingChange("taxRate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={businessSettings.currency}
                    onValueChange={(value) => handleBusinessSettingChange("currency", value)}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(currencies).map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.code} - {currency.name} ({currency.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timeZone">Time Zone</Label>
                  <Select
                    value={businessSettings.timeZone}
                    onValueChange={(value) => handleBusinessSettingChange("timeZone", value)}
                  >
                    <SelectTrigger id="timeZone">
                      <SelectValue placeholder="Select time zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT)</SelectItem>
                      <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                      <SelectItem value="Asia/Shanghai">Shanghai (CST)</SelectItem>
                      <SelectItem value="Australia/Sydney">Sydney (AEST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="receiptFooter">Receipt Footer</Label>
                <Textarea
                  id="receiptFooter"
                  value={businessSettings.receiptFooter}
                  onChange={(e) => handleBusinessSettingChange("receiptFooter", e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveBusinessSettings} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Business Settings"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Preferences</CardTitle>
              <CardDescription>Customize how your POS system works.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={systemSettings.theme}
                    onValueChange={(value) => handleSystemSettingChange("theme", value)}
                  >
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={systemSettings.language}
                    onValueChange={(value) => handleSystemSettingChange("language", value)}
                  >
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="autoLogout">Auto Logout (minutes)</Label>
                <Input
                  id="autoLogout"
                  type="number"
                  min="0"
                  value={systemSettings.autoLogout}
                  onChange={(e) => handleSystemSettingChange("autoLogout", e.target.value)}
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="offlineMode">Offline Mode</Label>
                    <p className="text-sm text-muted-foreground">Allow the POS to work without internet connection</p>
                  </div>
                  <Switch
                    id="offlineMode"
                    checked={systemSettings.enableOfflineMode}
                    onCheckedChange={(checked) => handleSystemSettingChange("enableOfflineMode", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="inventoryAlerts">Inventory Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications for low stock items</p>
                  </div>
                  <Switch
                    id="inventoryAlerts"
                    checked={systemSettings.enableInventoryAlerts}
                    onCheckedChange={(checked) => handleSystemSettingChange("enableInventoryAlerts", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="customerLoyalty">Customer Loyalty</Label>
                    <p className="text-sm text-muted-foreground">Enable customer loyalty program features</p>
                  </div>
                  <Switch
                    id="customerLoyalty"
                    checked={systemSettings.enableCustomerLoyalty}
                    onCheckedChange={(checked) => handleSystemSettingChange("enableCustomerLoyalty", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailReceipts">Email Receipts</Label>
                    <p className="text-sm text-muted-foreground">Send receipts to customers via email</p>
                  </div>
                  <Switch
                    id="emailReceipts"
                    checked={systemSettings.enableEmailReceipts}
                    onCheckedChange={(checked) => handleSystemSettingChange("enableEmailReceipts", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="smsNotifications">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send SMS notifications to customers</p>
                  </div>
                  <Switch
                    id="smsNotifications"
                    checked={systemSettings.enableSMSNotifications}
                    onCheckedChange={(checked) => handleSystemSettingChange("enableSMSNotifications", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="aiRecommendations">AI Recommendations</Label>
                    <p className="text-sm text-muted-foreground">Enable AI-powered product recommendations</p>
                  </div>
                  <Switch
                    id="aiRecommendations"
                    checked={systemSettings.enableAIRecommendations}
                    onCheckedChange={(checked) => handleSystemSettingChange("enableAIRecommendations", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="multiLanguage">Multi-Language Support</Label>
                    <p className="text-sm text-muted-foreground">Enable support for multiple languages</p>
                  </div>
                  <Switch
                    id="multiLanguage"
                    checked={systemSettings.enableMultiLanguage}
                    onCheckedChange={(checked) => handleSystemSettingChange("enableMultiLanguage", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="cryptoPayments">Cryptocurrency Payments</Label>
                    <p className="text-sm text-muted-foreground">Accept cryptocurrency payments</p>
                  </div>
                  <Switch
                    id="cryptoPayments"
                    checked={systemSettings.enableCryptocurrencyPayments}
                    onCheckedChange={(checked) => handleSystemSettingChange("enableCryptocurrencyPayments", checked)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save System Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="locations" className="space-y-4">
          <LocationManagement />
        </TabsContent>
        <TabsContent value="users" className="space-y-4">
          <UserRoleManagement />
        </TabsContent>
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Connect your POS with other services.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Payment Processors</h3>
                      <p className="text-sm text-muted-foreground">
                        Connect with payment gateways like Stripe, PayPal, Square, etc.
                      </p>
                    </div>
                    <Button>Configure</Button>
                  </div>
                </div>
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Accounting Software</h3>
                      <p className="text-sm text-muted-foreground">Connect with QuickBooks, Xero, FreshBooks, etc.</p>
                    </div>
                    <Button>Configure</Button>
                  </div>
                </div>
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">E-Commerce Platforms</h3>
                      <p className="text-sm text-muted-foreground">Connect with Shopify, WooCommerce, Magento, etc.</p>
                    </div>
                    <Button>Configure</Button>
                  </div>
                </div>
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Delivery Services</h3>
                      <p className="text-sm text-muted-foreground">Connect with UberEats, DoorDash, Postmates, etc.</p>
                    </div>
                    <Button>Configure</Button>
                  </div>
                </div>
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Marketing & CRM</h3>
                      <p className="text-sm text-muted-foreground">Connect with Mailchimp, HubSpot, Salesforce, etc.</p>
                    </div>
                    <Button>Configure</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security options for your POS system.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for all admin and manager accounts</p>
                  </div>
                  <Switch id="twoFactorAuth" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="passwordPolicy">Strong Password Policy</Label>
                    <p className="text-sm text-muted-foreground">Enforce complex passwords for all users</p>
                  </div>
                  <Switch id="passwordPolicy" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auditLogging">Audit Logging</Label>
                    <p className="text-sm text-muted-foreground">Keep detailed logs of all system activities</p>
                  </div>
                  <Switch id="auditLogging" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dataEncryption">Data Encryption</Label>
                    <p className="text-sm text-muted-foreground">Encrypt sensitive data at rest and in transit</p>
                  </div>
                  <Switch id="dataEncryption" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ipRestriction">IP Restriction</Label>
                    <p className="text-sm text-muted-foreground">Restrict access to specific IP addresses</p>
                  </div>
                  <Switch id="ipRestriction" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                <Input id="passwordExpiry" type="number" min="0" defaultValue="90" />
                <p className="text-xs text-muted-foreground">
                  Set to 0 to disable password expiry. Recommended: 90 days.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Security Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="localization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Localization Settings</CardTitle>
              <CardDescription>Configure language, currency, and regional settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultLanguage">Default Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger id="defaultLanguage">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                      <SelectItem value="ru">Russian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="additionalLanguages">Additional Languages</Label>
                  <Select defaultValue="none">
                    <SelectTrigger id="additionalLanguages">
                      <SelectValue placeholder="Select languages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                      <SelectItem value="ru">Russian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select defaultValue="MM/DD/YYYY">
                    <SelectTrigger id="dateFormat">
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeFormat">Time Format</Label>
                  <Select defaultValue="12h">
                    <SelectTrigger id="timeFormat">
                      <SelectValue placeholder="Select time format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                      <SelectItem value="24h">24-hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numberFormat">Number Format</Label>
                  <Select defaultValue="1,234.56">
                    <SelectTrigger id="numberFormat">
                      <SelectValue placeholder="Select number format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1,234.56">1,234.56</SelectItem>
                      <SelectItem value="1.234,56">1.234,56</SelectItem>
                      <SelectItem value="1 234.56">1 234.56</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstDayOfWeek">First Day of Week</Label>
                  <Select defaultValue="sunday">
                    <SelectTrigger id="firstDayOfWeek">
                      <SelectValue placeholder="Select first day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunday">Sunday</SelectItem>
                      <SelectItem value="monday">Monday</SelectItem>
                      <SelectItem value="saturday">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Localization Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="vercel" className="space-y-4">
          <VercelIntegrationSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}

