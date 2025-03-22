"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface EmployeeSettings {
  trackEmployeeHours: boolean
  requireClockInOut: boolean
  allowEmployeeDiscount: boolean
  employeeDiscountPercent: number
  requireManagerApproval: boolean
  securitySettings: {
    requirePinForLogin: boolean
    pinLength: number
    requirePasswordReset: boolean
    passwordResetDays: number
  }
  commissionSettings: {
    enableCommission: boolean
    commissionType: string
    commissionRate: number
  }
  scheduleSettings: {
    enableScheduling: boolean
    allowEmployeeSwap: boolean
    requireManagerApproval: boolean
    notifyScheduleChanges: boolean
  }
}

interface EmployeeSettingsFormProps {
  settings: EmployeeSettings
  onSave: (settings: EmployeeSettings) => void
  isSaving: boolean
}

export default function EmployeeSettingsForm({ settings, onSave, isSaving }: EmployeeSettingsFormProps) {
  const [formState, setFormState] = useState<EmployeeSettings>(settings)

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
        ...prev[section as keyof EmployeeSettings],
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
      <Accordion type="single" collapsible defaultValue="general-employee">
        <AccordionItem value="general-employee">
          <AccordionTrigger>General Employee Settings</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="track-hours"
                  checked={formState.trackEmployeeHours}
                  onCheckedChange={(checked) => handleChange("trackEmployeeHours", checked)}
                />
                <Label htmlFor="track-hours">Track Employee Hours</Label>
              </div>

              {formState.trackEmployeeHours && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="require-clock"
                    checked={formState.requireClockInOut}
                    onCheckedChange={(checked) => handleChange("requireClockInOut", checked)}
                  />
                  <Label htmlFor="require-clock">Require Clock In/Out</Label>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="allow-discount"
                  checked={formState.allowEmployeeDiscount}
                  onCheckedChange={(checked) => handleChange("allowEmployeeDiscount", checked)}
                />
                <Label htmlFor="allow-discount">Allow Employee Discount</Label>
              </div>

              {formState.allowEmployeeDiscount && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="discount-percent">Employee Discount Percentage (%)</Label>
                    <Input
                      id="discount-percent"
                      type="number"
                      min="0"
                      max="100"
                      value={formState.employeeDiscountPercent}
                      onChange={(e) => handleChange("employeeDiscountPercent", Number(e.target.value))}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="manager-approval"
                      checked={formState.requireManagerApproval}
                      onCheckedChange={(checked) => handleChange("requireManagerApproval", checked)}
                    />
                    <Label htmlFor="manager-approval">Require Manager Approval for Discount</Label>
                  </div>
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="security-settings">
          <AccordionTrigger>Security Settings</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="require-pin"
                  checked={formState.securitySettings.requirePinForLogin}
                  onCheckedChange={(checked) => handleNestedChange("securitySettings", "requirePinForLogin", checked)}
                />
                <Label htmlFor="require-pin">Require PIN for Login</Label>
              </div>

              {formState.securitySettings.requirePinForLogin && (
                <div className="space-y-2">
                  <Label htmlFor="pin-length">PIN Length</Label>
                  <Select
                    value={formState.securitySettings.pinLength.toString()}
                    onValueChange={(value) => handleNestedChange("securitySettings", "pinLength", Number(value))}
                  >
                    <SelectTrigger id="pin-length">
                      <SelectValue placeholder="Select PIN length" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 Digits</SelectItem>
                      <SelectItem value="6">6 Digits</SelectItem>
                      <SelectItem value="8">8 Digits</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="require-reset"
                  checked={formState.securitySettings.requirePasswordReset}
                  onCheckedChange={(checked) => handleNestedChange("securitySettings", "requirePasswordReset", checked)}
                />
                <Label htmlFor="require-reset">Require Password Reset</Label>
              </div>

              {formState.securitySettings.requirePasswordReset && (
                <div className="space-y-2">
                  <Label htmlFor="reset-days">Password Reset Interval (Days)</Label>
                  <Input
                    id="reset-days"
                    type="number"
                    min="1"
                    value={formState.securitySettings.passwordResetDays}
                    onChange={(e) =>
                      handleNestedChange("securitySettings", "passwordResetDays", Number(e.target.value))
                    }
                  />
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="commission-settings">
          <AccordionTrigger>Commission Settings</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-commission"
                  checked={formState.commissionSettings.enableCommission}
                  onCheckedChange={(checked) => handleNestedChange("commissionSettings", "enableCommission", checked)}
                />
                <Label htmlFor="enable-commission">Enable Commission</Label>
              </div>

              {formState.commissionSettings.enableCommission && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="commission-type">Commission Type</Label>
                    <Select
                      value={formState.commissionSettings.commissionType}
                      onValueChange={(value) => handleNestedChange("commissionSettings", "commissionType", value)}
                    >
                      <SelectTrigger id="commission-type">
                        <SelectValue placeholder="Select commission type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage of Sale</SelectItem>
                        <SelectItem value="fixed">Fixed Amount per Sale</SelectItem>
                        <SelectItem value="tiered">Tiered Commission</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="commission-rate">
                      {formState.commissionSettings.commissionType === "percentage"
                        ? "Commission Rate (%)"
                        : "Commission Amount"}
                    </Label>
                    <Input
                      id="commission-rate"
                      type="number"
                      min="0"
                      step={formState.commissionSettings.commissionType === "percentage" ? "0.1" : "0.01"}
                      value={formState.commissionSettings.commissionRate}
                      onChange={(e) =>
                        handleNestedChange("commissionSettings", "commissionRate", Number(e.target.value))
                      }
                    />
                  </div>
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="schedule-settings">
          <AccordionTrigger>Schedule Settings</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-scheduling"
                  checked={formState.scheduleSettings.enableScheduling}
                  onCheckedChange={(checked) => handleNestedChange("scheduleSettings", "enableScheduling", checked)}
                />
                <Label htmlFor="enable-scheduling">Enable Employee Scheduling</Label>
              </div>

              {formState.scheduleSettings.enableScheduling && (
                <>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="allow-swap"
                      checked={formState.scheduleSettings.allowEmployeeSwap}
                      onCheckedChange={(checked) =>
                        handleNestedChange("scheduleSettings", "allowEmployeeSwap", checked)
                      }
                    />
                    <Label htmlFor="allow-swap">Allow Employee Shift Swaps</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="schedule-approval"
                      checked={formState.scheduleSettings.requireManagerApproval}
                      onCheckedChange={(checked) =>
                        handleNestedChange("scheduleSettings", "requireManagerApproval", checked)
                      }
                    />
                    <Label htmlFor="schedule-approval">Require Manager Approval for Swaps</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notify-changes"
                      checked={formState.scheduleSettings.notifyScheduleChanges}
                      onCheckedChange={(checked) =>
                        handleNestedChange("scheduleSettings", "notifyScheduleChanges", checked)
                      }
                    />
                    <Label htmlFor="notify-changes">Notify Employees of Schedule Changes</Label>
                  </div>
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

