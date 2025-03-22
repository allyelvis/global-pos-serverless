"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2, Plus, Trash2 } from "lucide-react"
import type { GeneralSettings } from "@/lib/types/settings"
import { currencies } from "@/lib/currency"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"

interface GeneralSettingsFormProps {
  settings: GeneralSettings
  onSave: (settings: GeneralSettings) => void
  isSaving: boolean
}

export default function GeneralSettingsForm({ settings, onSave, isSaving }: GeneralSettingsFormProps) {
  const [formState, setFormState] = useState<GeneralSettings>(settings)

  const handleChange = (section: string, field: string, value: any) => {
    setFormState((prev) => {
      if (section === "root") {
        return { ...prev, [field]: value }
      } else {
        return {
          ...prev,
          [section]: {
            ...prev[section as keyof GeneralSettings],
            [field]: value,
          },
        }
      }
    })
  }

  const handleNestedChange = (section: string, nestedSection: string, field: string, value: any) => {
    setFormState((prev) => {
      const sectionData = prev[section as keyof GeneralSettings] as any
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [nestedSection]: {
            ...sectionData[nestedSection],
            [field]: value,
          },
        },
      }
    })
  }

  const handleAddLocation = () => {
    setFormState((prev) => {
      const newLocation = {
        id: `loc-${Date.now()}`,
        name: "New Location",
        address: "",
        isMainLocation: false,
        timeZone: prev.timeZone,
        operatingHours: { ...prev.operatingHours },
      }
      return {
        ...prev,
        locations: [...prev.locations, newLocation],
      }
    })
  }

  const handleRemoveLocation = (locationId: string) => {
    setFormState((prev) => ({
      ...prev,
      locations: prev.locations.filter((loc) => loc.id !== locationId),
    }))
  }

  const handleUpdateLocation = (index: number, field: string, value: any) => {
    setFormState((prev) => {
      const updatedLocations = [...prev.locations]
      updatedLocations[index] = {
        ...updatedLocations[index],
        [field]: value,
      }
      return {
        ...prev,
        locations: updatedLocations,
      }
    })
  }

  const handleAddTax = () => {
    setFormState((prev) => {
      const newTax = {
        name: "New Tax",
        rate: 0,
        appliesTo: [],
      }
      return {
        ...prev,
        tax: {
          ...prev.tax,
          additionalTaxes: [...prev.tax.additionalTaxes, newTax],
        },
      }
    })
  }

  const handleRemoveTax = (index: number) => {
    setFormState((prev) => {
      const updatedTaxes = [...prev.tax.additionalTaxes]
      updatedTaxes.splice(index, 1)
      return {
        ...prev,
        tax: {
          ...prev.tax,
          additionalTaxes: updatedTaxes,
        },
      }
    })
  }

  const handleUpdateTax = (index: number, field: string, value: any) => {
    setFormState((prev) => {
      const updatedTaxes = [...prev.tax.additionalTaxes]
      updatedTaxes[index] = {
        ...updatedTaxes[index],
        [field]: value,
      }
      return {
        ...prev,
        tax: {
          ...prev.tax,
          additionalTaxes: updatedTaxes,
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
      <Accordion type="single" collapsible defaultValue="business-profile">
        <AccordionItem value="business-profile">
          <AccordionTrigger>Business Profile</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input
                    id="business-name"
                    value={formState.businessProfile.name}
                    onChange={(e) => handleNestedChange("businessProfile", "name", "", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-logo">Logo URL</Label>
                  <Input
                    id="business-logo"
                    value={formState.businessProfile.logo || ""}
                    onChange={(e) => handleNestedChange("businessProfile", "logo", "", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-address">Address</Label>
                <Textarea
                  id="business-address"
                  value={formState.businessProfile.address}
                  onChange={(e) => handleNestedChange("businessProfile", "address", "", e.target.value)}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="business-phone">Phone</Label>
                  <Input
                    id="business-phone"
                    value={formState.businessProfile.contactDetails.phone}
                    onChange={(e) => handleNestedChange("businessProfile", "contactDetails", "phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-email">Email</Label>
                  <Input
                    id="business-email"
                    type="email"
                    value={formState.businessProfile.contactDetails.email}
                    onChange={(e) => handleNestedChange("businessProfile", "contactDetails", "email", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-website">Website</Label>
                <Input
                  id="business-website"
                  type="url"
                  value={formState.businessProfile.contactDetails.website || ""}
                  onChange={(e) => handleNestedChange("businessProfile", "contactDetails", "website", e.target.value)}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="industry-type">
          <AccordionTrigger>Industry Type</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="industry-type">Business Type</Label>
                <Select
                  value={formState.industryType}
                  onValueChange={(value) => handleChange("root", "industryType", value)}
                >
                  <SelectTrigger id="industry-type">
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
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="locations">
          <AccordionTrigger>Locations</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button type="button" onClick={handleAddLocation} variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Location
                </Button>
              </div>

              {formState.locations.map((location, index) => (
                <Card key={location.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-lg font-medium">{location.name}</h4>
                      <Button
                        type="button"
                        onClick={() => handleRemoveLocation(location.id)}
                        variant="ghost"
                        size="sm"
                        disabled={location.isMainLocation}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`location-name-${index}`}>Location Name</Label>
                        <Input
                          id={`location-name-${index}`}
                          value={location.name}
                          onChange={(e) => handleUpdateLocation(index, "name", e.target.value)}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`main-location-${index}`}
                          checked={location.isMainLocation}
                          onCheckedChange={(checked) => {
                            // If setting this location as main, unset others
                            if (checked) {
                              setFormState((prev) => ({
                                ...prev,
                                locations: prev.locations.map((loc, i) => ({
                                  ...loc,
                                  isMainLocation: i === index,
                                })),
                              }))
                            } else {
                              handleUpdateLocation(index, "isMainLocation", false)
                            }
                          }}
                        />
                        <Label htmlFor={`main-location-${index}`}>Main Location</Label>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <Label htmlFor={`location-address-${index}`}>Address</Label>
                      <Textarea
                        id={`location-address-${index}`}
                        value={location.address}
                        onChange={(e) => handleUpdateLocation(index, "address", e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div className="mt-4 space-y-2">
                      <Label htmlFor={`location-timezone-${index}`}>Time Zone</Label>
                      <Select
                        value={location.timeZone}
                        onValueChange={(value) => handleUpdateLocation(index, "timeZone", value)}
                      >
                        <SelectTrigger id={`location-timezone-${index}`}>
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
                  </CardContent>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="currency-tax">
          <AccordionTrigger>Currency & Tax</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currency-code">Currency</Label>
                  <Select
                    value={formState.currency.code}
                    onValueChange={(value) => handleNestedChange("currency", "code", "", value)}
                  >
                    <SelectTrigger id="currency-code">
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
                <div className="space-y-2">
                  <Label htmlFor="currency-position">Symbol Position</Label>
                  <Select
                    value={formState.currency.position}
                    onValueChange={(value) => handleNestedChange("currency", "position", "", value)}
                  >
                    <SelectTrigger id="currency-position">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="before">Before ($100.00)</SelectItem>
                      <SelectItem value="after">After (100.00$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="tax-enabled"
                    checked={formState.tax.enabled}
                    onCheckedChange={(checked) => handleNestedChange("tax", "enabled", "", checked)}
                  />
                  <Label htmlFor="tax-enabled">Enable Tax</Label>
                </div>
              </div>

              {formState.tax.enabled && (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="default-tax-rate">Default Tax Rate (%)</Label>
                      <Input
                        id="default-tax-rate"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formState.tax.defaultRate}
                        onChange={(e) =>
                          handleNestedChange("tax", "defaultRate", "", Number.parseFloat(e.target.value))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="tax-inclusive"
                          checked={formState.tax.taxInclusive}
                          onCheckedChange={(checked) => handleNestedChange("tax", "taxInclusive", "", checked)}
                        />
                        <Label htmlFor="tax-inclusive">Tax Inclusive Pricing</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Additional Taxes</Label>
                      <Button type="button" onClick={handleAddTax} variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Tax
                      </Button>
                    </div>

                    {formState.tax.additionalTaxes.map((tax, index) => (
                      <div key={index} className="mt-2 grid grid-cols-12 gap-2 rounded-md border p-2">
                        <div className="col-span-5">
                          <Input
                            placeholder="Tax Name"
                            value={tax.name}
                            onChange={(e) => handleUpdateTax(index, "name", e.target.value)}
                          />
                        </div>
                        <div className="col-span-5">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            placeholder="Rate (%)"
                            value={tax.rate}
                            onChange={(e) => handleUpdateTax(index, "rate", Number.parseFloat(e.target.value))}
                          />
                        </div>
                        <div className="col-span-2 flex items-center justify-end">
                          <Button type="button" onClick={() => handleRemoveTax(index)} variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="localization">
          <AccordionTrigger>Localization</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={formState.language} onValueChange={(value) => handleChange("root", "language", value)}>
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
                      <SelectItem value="ar">Arabic</SelectItem>
                      <SelectItem value="ru">Russian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select
                    value={formState.localization.dateFormat}
                    onValueChange={(value) => handleNestedChange("localization", "dateFormat", "", value)}
                  >
                    <SelectTrigger id="date-format">
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="time-format">Time Format</Label>
                  <Select
                    value={formState.localization.timeFormat}
                    onValueChange={(value) => handleNestedChange("localization", "timeFormat", "", value)}
                  >
                    <SelectTrigger id="time-format">
                      <SelectValue placeholder="Select time format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                      <SelectItem value="24h">24-hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="first-day">First Day of Week</Label>
                  <Select
                    value={formState.localization.firstDayOfWeek}
                    onValueChange={(value) => handleNestedChange("localization", "firstDayOfWeek", "", value as any)}
                  >
                    <SelectTrigger id="first-day">
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
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="data-backup">
          <AccordionTrigger>Data Backup & System Updates</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Data Backup</Label>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="backup-frequency">Backup Frequency</Label>
                    <Select
                      value={formState.dataBackup.frequency}
                      onValueChange={(value) => handleNestedChange("dataBackup", "frequency", "", value as any)}
                    >
                      <SelectTrigger id="backup-frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backup-time">Backup Time</Label>
                    <Input
                      id="backup-time"
                      type="time"
                      value={formState.dataBackup.time}
                      onChange={(e) => handleNestedChange("dataBackup", "time", "", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="retention-period">Retention Period (days)</Label>
                    <Input
                      id="retention-period"
                      type="number"
                      min="1"
                      value={formState.dataBackup.retentionPeriod}
                      onChange={(e) =>
                        handleNestedChange("dataBackup", "retentionPeriod", "", Number.parseInt(e.target.value))
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="cloud-sync"
                      checked={formState.dataBackup.cloudSync}
                      onCheckedChange={(checked) => handleNestedChange("dataBackup", "cloudSync", "", checked)}
                    />
                    <Label htmlFor="cloud-sync">Enable Cloud Sync</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>System Updates</Label>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-update"
                      checked={formState.systemUpdates.autoUpdate}
                      onCheckedChange={(checked) => handleNestedChange("systemUpdates", "autoUpdate", "", checked)}
                    />
                    <Label htmlFor="auto-update">Automatic Updates</Label>
                  </div>
                  {formState.systemUpdates.autoUpdate && (
                    <div className="space-y-2">
                      <Label htmlFor="update-time">Update Time</Label>
                      <Input
                        id="update-time"
                        type="time"
                        value={formState.systemUpdates.updateTime}
                        onChange={(e) => handleNestedChange("systemUpdates", "updateTime", "", e.target.value)}
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="notify-update"
                    checked={formState.systemUpdates.notifyBeforeUpdate}
                    onCheckedChange={(checked) =>
                      handleNestedChange("systemUpdates", "notifyBeforeUpdate", "", checked)
                    }
                  />
                  <Label htmlFor="notify-update">Notify Before Updates</Label>
                </div>
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

