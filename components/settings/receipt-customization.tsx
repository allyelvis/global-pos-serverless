"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, Printer, FileText, QrCode } from "lucide-react"
import { useI18n } from "@/lib/i18n/i18n-provider"

// Types
interface ReceiptSettings {
  general: {
    paperSize: string
    printLogo: boolean
    printDateTime: boolean
    printOrderNumber: boolean
    printEmployeeName: boolean
    printBusinessInfo: boolean
    printCustomerInfo: boolean
    fontSize: string
    fontFamily: string
  }
  header: {
    businessName: string
    businessAddress: string
    businessPhone: string
    businessEmail: string
    businessWebsite: string
    logoUrl: string
    tagline: string
  }
  content: {
    showItemSku: boolean
    showItemDescription: boolean
    showItemPrice: boolean
    showItemQuantity: boolean
    showItemDiscount: boolean
    showItemTax: boolean
    showItemTotal: boolean
    showSubtotal: boolean
    showTaxDetails: boolean
    showDiscountDetails: boolean
    showPaymentMethod: boolean
  }
  footer: {
    thankYouMessage: string
    returnPolicy: string
    showSocialMedia: boolean
    socialMediaHandles: {
      facebook: string
      instagram: string
      twitter: string
    }
    showQrCode: boolean
    qrCodeType: string
    qrCodeValue: string
    additionalNotes: string
    showPromotions: boolean
    promotionalText: string
  }
}

export function ReceiptCustomization() {
  const { t } = useI18n()
  const { toast } = useToast()
  const [settings, setSettings] = useState<ReceiptSettings>({
    general: {
      paperSize: "80mm",
      printLogo: true,
      printDateTime: true,
      printOrderNumber: true,
      printEmployeeName: true,
      printBusinessInfo: true,
      printCustomerInfo: true,
      fontSize: "normal",
      fontFamily: "sans-serif",
    },
    header: {
      businessName: "Global POS",
      businessAddress: "123 Main Street, City, Country",
      businessPhone: "+1 234 567 890",
      businessEmail: "info@globalpos.com",
      businessWebsite: "www.globalpos.com",
      logoUrl: "",
      tagline: "Thank you for your business!",
    },
    content: {
      showItemSku: true,
      showItemDescription: true,
      showItemPrice: true,
      showItemQuantity: true,
      showItemDiscount: true,
      showItemTax: true,
      showItemTotal: true,
      showSubtotal: true,
      showTaxDetails: true,
      showDiscountDetails: true,
      showPaymentMethod: true,
    },
    footer: {
      thankYouMessage: "Thank you for shopping with us!",
      returnPolicy: "Returns accepted within 30 days with receipt.",
      showSocialMedia: true,
      socialMediaHandles: {
        facebook: "globalpos",
        instagram: "globalpos",
        twitter: "globalpos",
      },
      showQrCode: true,
      qrCodeType: "website",
      qrCodeValue: "https://www.globalpos.com",
      additionalNotes: "",
      showPromotions: true,
      promotionalText: "10% off your next purchase with this receipt!",
    },
  })
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop")

  const handleGeneralChange = (field: keyof ReceiptSettings["general"], value: any) => {
    setSettings((prev) => ({
      ...prev,
      general: {
        ...prev.general,
        [field]: value,
      },
    }))
  }

  const handleHeaderChange = (field: keyof ReceiptSettings["header"], value: string) => {
    setSettings((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        [field]: value,
      },
    }))
  }

  const handleContentChange = (field: keyof ReceiptSettings["content"], value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value,
      },
    }))
  }

  const handleFooterChange = (field: keyof ReceiptSettings["footer"], value: any) => {
    setSettings((prev) => ({
      ...prev,
      footer: {
        ...prev.footer,
        [field]: value,
      },
    }))
  }

  const handleSocialMediaChange = (platform: keyof ReceiptSettings["footer"]["socialMediaHandles"], value: string) => {
    setSettings((prev) => ({
      ...prev,
      footer: {
        ...prev.footer,
        socialMediaHandles: {
          ...prev.footer.socialMediaHandles,
          [platform]: value,
        },
      },
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: t("receipt.saveSuccess"),
        description: t("receipt.saveSuccessDesc"),
      })
    } catch (error) {
      toast({
        title: t("receipt.saveError"),
        description: t("receipt.saveErrorDesc"),
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const ReceiptPreview = () => {
    const { general, header, content, footer } = settings

    return (
      <div
        className={`mx-auto ${general.paperSize === "80mm" ? "w-64" : "w-96"} rounded-md border bg-white p-4 shadow-sm`}
      >
        {/* Header */}
        <div className="border-b pb-2 text-center">
          {general.printLogo && header.logoUrl && (
            <div className="mb-2 flex justify-center">
              <img src={header.logoUrl || "/placeholder.svg"} alt="Business Logo" className="h-16 w-auto" />
            </div>
          )}
          <div
            className={`font-bold ${general.fontSize === "small" ? "text-sm" : general.fontSize === "large" ? "text-lg" : "text-base"}`}
          >
            {header.businessName}
          </div>
          {general.printBusinessInfo && (
            <div className="text-xs">
              <div>{header.businessAddress}</div>
              <div>{header.businessPhone}</div>
              <div>{header.businessEmail}</div>
              <div>{header.businessWebsite}</div>
            </div>
          )}
          <div className="mt-1 text-xs italic">{header.tagline}</div>
        </div>

        {/* Order Info */}
        <div className="border-b py-2 text-xs">
          {general.printDateTime && (
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          )}
          {general.printDateTime && (
            <div className="flex justify-between">
              <span>Time:</span>
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          )}
          {general.printOrderNumber && (
            <div className="flex justify-between">
              <span>Order #:</span>
              <span>1001</span>
            </div>
          )}
          {general.printEmployeeName && (
            <div className="flex justify-between">
              <span>Employee:</span>
              <span>John Doe</span>
            </div>
          )}
          {general.printCustomerInfo && (
            <div className="mt-1">
              <div>Customer: Jane Smith</div>
              <div>Phone: +1 234 567 890</div>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="border-b py-2">
          <div className="mb-1 text-center text-xs font-bold">ORDER DETAILS</div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                {content.showItemQuantity && <th className="py-1 text-left">Qty</th>}
                <th className="py-1 text-left">Item</th>
                {content.showItemPrice && <th className="py-1 text-right">Price</th>}
                {content.showItemTotal && <th className="py-1 text-right">Total</th>}
              </tr>
            </thead>
            <tbody>
              <tr>
                {content.showItemQuantity && <td className="py-1">2</td>}
                <td className="py-1">
                  Coffee
                  {content.showItemSku && <div className="text-[10px] text-gray-500">SKU: CF001</div>}
                  {content.showItemDescription && <div className="text-[10px] text-gray-500">Large, Black</div>}
                </td>
                {content.showItemPrice && <td className="py-1 text-right">$3.50</td>}
                {content.showItemTotal && <td className="py-1 text-right">$7.00</td>}
              </tr>
              <tr>
                {content.showItemQuantity && <td className="py-1">1</td>}
                <td className="py-1">
                  Sandwich
                  {content.showItemSku && <div className="text-[10px] text-gray-500">SKU: SW002</div>}
                  {content.showItemDescription && <div className="text-[10px] text-gray-500">Chicken, No Mayo</div>}
                </td>
                {content.showItemPrice && <td className="py-1 text-right">$5.99</td>}
                {content.showItemTotal && <td className="py-1 text-right">$5.99</td>}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-b py-2 text-xs">
          {content.showSubtotal && (
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>$12.99</span>
            </div>
          )}
          {content.showTaxDetails && (
            <div className="flex justify-between">
              <span>Tax (8%):</span>
              <span>$1.04</span>
            </div>
          )}
          {content.showDiscountDetails && (
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>-$1.00</span>
            </div>
          )}
          <div className="mt-1 flex justify-between font-bold">
            <span>Total:</span>
            <span>$13.03</span>
          </div>
          {content.showPaymentMethod && (
            <div className="mt-1">
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span>Credit Card</span>
              </div>
              <div className="flex justify-between">
                <span>Amount Paid:</span>
                <span>$13.03</span>
              </div>
              <div className="flex justify-between">
                <span>Change:</span>
                <span>$0.00</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 text-center text-xs">
          <div className="font-bold">{footer.thankYouMessage}</div>
          <div className="mt-1 text-[10px]">{footer.returnPolicy}</div>

          {footer.showSocialMedia && (
            <div className="mt-1 text-[10px]">
              {footer.socialMediaHandles.facebook && <div>Facebook: @{footer.socialMediaHandles.facebook}</div>}
              {footer.socialMediaHandles.instagram && <div>Instagram: @{footer.socialMediaHandles.instagram}</div>}
              {footer.socialMediaHandles.twitter && <div>Twitter: @{footer.socialMediaHandles.twitter}</div>}
            </div>
          )}

          {footer.showQrCode && (
            <div className="mt-2 flex justify-center">
              <div className="h-16 w-16 rounded border bg-gray-100 p-1">
                <div className="flex h-full items-center justify-center">
                  <QrCode className="h-10 w-10 text-gray-400" />
                </div>
              </div>
            </div>
          )}

          {footer.additionalNotes && <div className="mt-1 text-[10px]">{footer.additionalNotes}</div>}

          {footer.showPromotions && (
            <div className="mt-2 rounded-sm border border-dashed border-gray-300 p-1 text-[10px]">
              {footer.promotionalText}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">{t("receipt.general")}</TabsTrigger>
            <TabsTrigger value="header">{t("receipt.header")}</TabsTrigger>
            <TabsTrigger value="content">{t("receipt.content")}</TabsTrigger>
            <TabsTrigger value="footer">{t("receipt.footer")}</TabsTrigger>
          </TabsList>
          
          <div className="mt-4 space-y-4">
            <TabsContent value="general" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="paper-size">{t("receipt.paperSize")}</Label>
                  <Select
                    value={settings.general.paperSize}
                    onValueChange={(value) => handleGeneralChange("paperSize", value)}
                  >
                    <SelectTrigger id="paper-size">
                      <SelectValue placeholder={t("receipt.selectPaperSize")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="58mm">58mm</SelectItem>
                      <SelectItem value="80mm">80mm</SelectItem>
                      <SelectItem value="a4">A4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="font-size">{t("receipt.fontSize")}</Label>
                  <Select
                    value={settings.general.fontSize}
                    onValueChange={(value) => handleGeneralChange("fontSize", value)}
                  >
                    <SelectTrigger id="font-size">
                      <SelectValue placeholder={t("receipt.selectFontSize")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">{t("receipt.small")}</SelectItem>
                      <SelectItem value="normal">{t("receipt.normal")}</SelectItem>
                      <SelectItem value="large">{t("receipt.large")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="font-family">{t("receipt.fontFamily")}</Label>
                  <Select
                    value={settings.general.fontFamily}
                    onValueChange={(value) => handleGeneralChange("fontFamily", value)}
                  >
                    <SelectTrigger id="font-family">
                      <SelectValue placeholder={t("receipt.selectFontFamily")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sans-serif">{t("receipt.sansSerif")}</SelectItem>
                      <SelectItem value="serif">{t("receipt.serif")}</SelectItem>
                      <SelectItem value="monospace">{t("receipt.monospace")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>{t("receipt.printOptions")}</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="print-logo"
                      checked={settings.general.printLogo}
                      onCheckedChange={(checked) => handleGeneralChange("printLogo", checked)}
                    />
                    <Label htmlFor="print-logo">{t("receipt.printLogo")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="print-date-time"
                      checked={settings.general.printDateTime}
                      onCheckedChange={(checked) => handleGeneralChange("printDateTime", checked)}
                    />
                    <Label htmlFor="print-date-time">{t("receipt.printDateTime")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="print-order-number"
                      checked={settings.general.printOrderNumber}
                      onCheckedChange={(checked) => handleGeneralChange("printOrderNumber", checked)}
                    />
                    <Label htmlFor="print-order-number">{t("receipt.printOrderNumber")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="print-employee-name"
                      checked={settings.general.printEmployeeName}
                      onCheckedChange={(checked) => handleGeneralChange("printEmployeeName", checked)}
                    />
                    <Label htmlFor="print-employee-name">{t("receipt.printEmployeeName")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="print-business-info"
                      checked={settings.general.printBusinessInfo}
                      onCheckedChange={(checked) => handleGeneralChange("printBusinessInfo", checked)}
                    />
                    <Label htmlFor="print-business-info">{t("receipt.printBusinessInfo")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="print-customer-info"
                      checked={settings.general.printCustomerInfo}
                      onCheckedChange={(checked) => handleGeneralChange("printCustomerInfo", checked)}
                    />
                    <Label htmlFor="print-customer-info">{t("receipt.printCustomerInfo")}</Label>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="header" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="business-name">{t("receipt.businessName")}</Label>
                  <Input
                    id="business-name"
                    value={settings.header.businessName}
                    onChange={(e) => handleHeaderChange("businessName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-phone">{t("receipt.businessPhone")}</Label>
                  <Input
                    id="business-phone"
                    value={settings.header.businessPhone}
                    onChange={(e) => handleHeaderChange("businessPhone", e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="business-address">{t("receipt.businessAddress")}</Label>
                  <Input
                    id="business-address"
                    value={settings.header.businessAddress}
                    onChange={(e) => handleHeaderChange("businessAddress", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-email">{t("receipt.businessEmail")}</Label>
                  <Input
                    id="business-email"
                    value={settings.header.businessEmail}
                    onChange={(e) => handleHeaderChange("businessEmail", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-website">{t("receipt.businessWebsite")}</Label>
                  <Input
                    id="business-website"
                    value={settings.header.businessWebsite}
                    onChange={(e) => handleHeaderChange("businessWebsite", e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="logo-url">{t("receipt.logoUrl")}</Label>
                  <Input
                    id="logo-url"
                    value={settings.header.logoUrl}
                    onChange={(e) => handleHeaderChange("logoUrl", e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="tagline">{t("receipt.tagline")}</Label>
                  <Input
                    id="tagline"
                    value={settings.header.tagline}
                    onChange={(e) => handleHeaderChange("tagline", e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="content" className="space-y-4">
              <div className="space-y-2">
                <Label>{t("receipt.itemDetails")}</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-item-sku"
                      checked={settings.content.showItemSku}
                      onCheckedChange={(checked) => handleContentChange("showItemSku", checked)}
                    />
                    <Label htmlFor="show-item-sku">{t("receipt.showItemSku")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-item-description"
                      checked={settings.content.showItemDescription}
                      onCheckedChange={(checked) => handleContentChange("showItemDescription", checked)}
                    />
                    <Label htmlFor="show-item-description">{t("receipt.showItemDescription")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-item-price"
                      checked={settings.content.showItemPrice}
                      onCheckedChange={(checked) => handleContentChange("showItemPrice", checked)}
                    />
                    <Label htmlFor="show-item-price">{t("receipt.showItemPrice")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-item-quantity"
                      checked={settings.content.showItemQuantity}
                      onCheckedChange={(checked) => handleContentChange("showItemQuantity", checked)}
                    />
                    <Label htmlFor="show-item-quantity">{t("receipt.showItemQuantity")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-item-discount"
                      checked={settings.content.showItemDiscount}
                      onCheckedChange={(checked) => handleContentChange("showItemDiscount", checked)}
                    />
                    <Label htmlFor="show-item-discount">{t("receipt.showItemDiscount")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-item-tax"
                      checked={settings.content.showItemTax}
                      onCheckedChange={(checked) => handleContentChange("showItemTax", checked)}
                    />
                    <Label htmlFor="show-item-tax">{t("receipt.showItemTax")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-item-total"
                      checked={settings.content.showItemTotal}
                      onCheckedChange={(checked) => handleContentChange("showItemTotal", checked)}
                    />
                    <Label htmlFor="show-item-total">{t("receipt.showItemTotal")}</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>{t("receipt.orderSummary")}</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-subtotal"
                      checked={settings.content.showSubtotal}
                      onCheckedChange={(checked) => handleContentChange("showSubtotal", checked)}
                    />
                    <Label htmlFor="show-subtotal">{t("receipt.showSubtotal")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-tax-details"
                      checked={settings.content.showTaxDetails}
                      onCheckedChange={(checked) => handleContentChange("showTaxDetails", checked)}
                    />
                    <Label htmlFor="show-tax-details">{t("receipt.showTaxDetails")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-discount-details"
                      checked={settings.content.showDiscountDetails}
                      onCheckedChange={(checked) => handleContentChange("showDiscountDetails", checked)}
                    />
                    <Label htmlFor="show-discount-details">{t("receipt.showDiscountDetails")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-payment-method"
                      checked={settings.content.showPaymentMethod}
                      onCheckedChange={(checked) => handleContentChange("showPaymentMethod", checked)}
                    />
                    <Label htmlFor="show-payment-method">{t("receipt.showPaymentMethod")}</Label>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="footer" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="thank-you-message">{t("receipt.thankYouMessage")}</Label>
                  <Input
                    id="thank-you-message"
                    value={settings.footer.thankYouMessage}
                    onChange={(e) => handleFooterChange("thankYouMessage", e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="return-policy">{t("receipt.returnPolicy")}</Label>
                  <Input
                    id="return-policy"
                    value={settings.footer.returnPolicy}
                    onChange={(e) => handleFooterChange("returnPolicy", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-social-media">{t("receipt.socialMedia")}</Label>
                  <Switch
                    id="show-social-media"
                    checked={settings.footer.showSocialMedia}
                    onCheckedChange={(checked) => handleFooterChange("showSocialMedia", checked)}
                  />
                </div>
                
                {settings.footer.showSocialMedia && (
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="facebook-handle">{t("receipt.facebook")}</Label>
                      <Input
                        id="facebook-handle"
                        value={settings.footer.socialMediaHandles.facebook}
                        onChange={(e) => handleSocialMediaChange("facebook", e.target.value)}
                        placeholder="yourbusiness"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagram-handle">{t("receipt.instagram")}</Label>
                      <Input
                        id="instagram-handle"
                        value={settings.footer.socialMediaHandles.instagram}
                        onChange={(e) => handleSocialMediaChange("instagram", e.target.value)}
                        placeholder="yourbusiness"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitter-handle">{t("receipt.twitter")}</Label>
                      <Input
                        id="twitter-handle"
                        value={settings.footer.socialMediaHandles.twitter}
                        onChange={(e) => handleSocialMediaChange("twitter", e.target.value)}
                        placeholder="yourbusiness"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-qr-code">{t("receipt.qrCode")}</Label>
                  <Switch
                    id="show-qr-code"
                    checked={settings.footer.showQrCode}
                    onCheckedChange={(checked) => handleFooterChange("showQrCode", checked)}
                  />
                </div>
                
                {settings.footer.showQrCode && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="qr-code-type">{t("receipt.qrCodeType")}</Label>
                      <Select
                        value={settings.footer.qrCodeType}
                        onValueChange={(value) => handleFooterChange("qrCodeType", value)}
                      >
                        <SelectTrigger id="qr-code-type">
                          <SelectValue placeholder={t("receipt.selectQrCodeType")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="website">{t("receipt.website")}</SelectItem>
                          <SelectItem value="feedback">{t("receipt.feedback")}</SelectItem>
                          <SelectItem value="social">{t("receipt.social")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="qr-code-value">{t("receipt.qrCodeValue")}</Label>
                      <Input
                        id="qr-code-value"
                        value={settings.footer.qrCodeValue}
                        onChange={(e) => handleFooterChange("qrCodeValue", e.target.value)}
                        placeholder="https://example.com"\
                  e.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-promotions">{t("receipt.promotions")}</Label>
                  <Switch
                    id="show-promotions"
                    checked={settings.footer.showPromotions}
                    onCheckedChange={(checked) => handleFooterChange("showPromotions", checked)}
                  />
                </div>
                
                {settings.footer.showPromotions && (
                  <div className="space-y-2">
                    <Label htmlFor="promotional-text">{t("receipt.promotionalText")}</Label>
                    <Input
                      id="promotional-text"
                      value={settings.footer.promotionalText}
                      onChange={(e) => handleFooterChange("promotionalText", e.target.value)}
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="additional-notes">{t("receipt.additionalNotes")}</Label>
                <Textarea
                  id="additional-notes"
                  value={settings.footer.additionalNotes}
                  onChange={(e) => handleFooterChange("additionalNotes", e.target.value)}
                  placeholder={t("receipt.additionalNotesPlaceholder")}
                  rows={3}
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>
        
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("common.saving")}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {t("common.save")}
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium">{t("receipt.preview")}</h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant={previewMode === "desktop" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewMode("desktop")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {t("receipt.desktop")}
                </Button>
                <Button
                  variant={previewMode === "mobile" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewMode("mobile")}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  {t("receipt.thermal")}
                </Button>
              </div>
            </div>
            
            <div className={`overflow-auto rounded-lg bg-gray-100 p-4 ${previewMode === "mobile" ? "max-w-[320px] mx-auto" : ""}`}>
              <ReceiptPreview />
            </div>
            
            <div className="mt-4 flex justify-center">
              <Button variant="outline" size="sm">
                <Printer className="mr-2 h-4 w-4" />
                {t("receipt.testPrint")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

