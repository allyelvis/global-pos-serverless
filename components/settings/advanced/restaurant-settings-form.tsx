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

interface RestaurantSettings {
  enableTableManagement: boolean
  tableLayout: {
    autoAssignTables: boolean
    showTableStatus: boolean
  }
  kitchenDisplay: {
    enabled: boolean
    autoSortOrders: boolean
    displayCookingTime: boolean
    alertOverdueOrders: boolean
  }
  orderSettings: {
    allowSplitBills: boolean
    requireItemModifiers: boolean
    allowCustomModifiers: boolean
    enableCourses: boolean
  }
  menuSettings: {
    showNutritionInfo: boolean
    showAllergenInfo: boolean
    enableSpecials: boolean
    enableSeasonalItems: boolean
  }
  reservations: {
    enabled: boolean
    allowOnlineReservations: boolean
    reservationTimeSlotMinutes: number
    requireDeposit: boolean
    depositAmount: number
  }
}

interface RestaurantSettingsFormProps {
  settings: RestaurantSettings
  onSave: (settings: RestaurantSettings) => void
  isSaving: boolean
}

export default function RestaurantSettingsForm({ settings, onSave, isSaving }: RestaurantSettingsFormProps) {
  const [formState, setFormState] = useState<RestaurantSettings>(settings)

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
        ...prev[section as keyof RestaurantSettings],
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
      <Accordion type="single" collapsible defaultValue="table-management">
        <AccordionItem value="table-management">
          <AccordionTrigger>Table Management</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-table-management"
                  checked={formState.enableTableManagement}
                  onCheckedChange={(checked) => handleChange("enableTableManagement", checked)}
                />
                <Label htmlFor="enable-table-management">Enable Table Management</Label>
              </div>

              {formState.enableTableManagement && (
                <>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-assign-tables"
                      checked={formState.tableLayout.autoAssignTables}
                      onCheckedChange={(checked) => handleNestedChange("tableLayout", "autoAssignTables", checked)}
                    />
                    <Label htmlFor="auto-assign-tables">Auto-Assign Tables</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-table-status"
                      checked={formState.tableLayout.showTableStatus}
                      onCheckedChange={(checked) => handleNestedChange("tableLayout", "showTableStatus", checked)}
                    />
                    <Label htmlFor="show-table-status">Show Table Status</Label>
                  </div>
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="kitchen-display">
          <AccordionTrigger>Kitchen Display System</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-kitchen-display"
                  checked={formState.kitchenDisplay.enabled}
                  onCheckedChange={(checked) => handleNestedChange("kitchenDisplay", "enabled", checked)}
                />
                <Label htmlFor="enable-kitchen-display">Enable Kitchen Display</Label>
              </div>

              {formState.kitchenDisplay.enabled && (
                <>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-sort-orders"
                      checked={formState.kitchenDisplay.autoSortOrders}
                      onCheckedChange={(checked) => handleNestedChange("kitchenDisplay", "autoSortOrders", checked)}
                    />
                    <Label htmlFor="auto-sort-orders">Auto-Sort Orders</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="display-cooking-time"
                      checked={formState.kitchenDisplay.displayCookingTime}
                      onCheckedChange={(checked) => handleNestedChange("kitchenDisplay", "displayCookingTime", checked)}
                    />
                    <Label htmlFor="display-cooking-time">Display Cooking Time</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="alert-overdue"
                      checked={formState.kitchenDisplay.alertOverdueOrders}
                      onCheckedChange={(checked) => handleNestedChange("kitchenDisplay", "alertOverdueOrders", checked)}
                    />
                    <Label htmlFor="alert-overdue">Alert Overdue Orders</Label>
                  </div>
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="order-settings">
          <AccordionTrigger>Order Settings</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="allow-split-bills"
                  checked={formState.orderSettings.allowSplitBills}
                  onCheckedChange={(checked) => handleNestedChange("orderSettings", "allowSplitBills", checked)}
                />
                <Label htmlFor="allow-split-bills">Allow Split Bills</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="require-modifiers"
                  checked={formState.orderSettings.requireItemModifiers}
                  onCheckedChange={(checked) => handleNestedChange("orderSettings", "requireItemModifiers", checked)}
                />
                <Label htmlFor="require-modifiers">Require Item Modifiers</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="allow-custom-modifiers"
                  checked={formState.orderSettings.allowCustomModifiers}
                  onCheckedChange={(checked) => handleNestedChange("orderSettings", "allowCustomModifiers", checked)}
                />
                <Label htmlFor="allow-custom-modifiers">Allow Custom Modifiers</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-courses"
                  checked={formState.orderSettings.enableCourses}
                  onCheckedChange={(checked) => handleNestedChange("orderSettings", "enableCourses", checked)}
                />
                <Label htmlFor="enable-courses">Enable Courses</Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="menu-settings">
          <AccordionTrigger>Menu Settings</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-nutrition"
                  checked={formState.menuSettings.showNutritionInfo}
                  onCheckedChange={(checked) => handleNestedChange("menuSettings", "showNutritionInfo", checked)}
                />
                <Label htmlFor="show-nutrition">Show Nutrition Information</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="show-allergen"
                  checked={formState.menuSettings.showAllergenInfo}
                  onCheckedChange={(checked) => handleNestedChange("menuSettings", "showAllergenInfo", checked)}
                />
                <Label htmlFor="show-allergen">Show Allergen Information</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-specials"
                  checked={formState.menuSettings.enableSpecials}
                  onCheckedChange={(checked) => handleNestedChange("menuSettings", "enableSpecials", checked)}
                />
                <Label htmlFor="enable-specials">Enable Daily Specials</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-seasonal"
                  checked={formState.menuSettings.enableSeasonalItems}
                  onCheckedChange={(checked) => handleNestedChange("menuSettings", "enableSeasonalItems", checked)}
                />
                <Label htmlFor="enable-seasonal">Enable Seasonal Items</Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="reservations">
          <AccordionTrigger>Reservations</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-reservations"
                  checked={formState.reservations.enabled}
                  onCheckedChange={(checked) => handleNestedChange("reservations", "enabled", checked)}
                />
                <Label htmlFor="enable-reservations">Enable Reservations</Label>
              </div>

              {formState.reservations.enabled && (
                <>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="online-reservations"
                      checked={formState.reservations.allowOnlineReservations}
                      onCheckedChange={(checked) =>
                        handleNestedChange("reservations", "allowOnlineReservations", checked)
                      }
                    />
                    <Label htmlFor="online-reservations">Allow Online Reservations</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time-slot">Reservation Time Slot (minutes)</Label>
                    <Select
                      value={formState.reservations.reservationTimeSlotMinutes.toString()}
                      onValueChange={(value) =>
                        handleNestedChange("reservations", "reservationTimeSlotMinutes", Number(value))
                      }
                    >
                      <SelectTrigger id="time-slot">
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="require-deposit"
                      checked={formState.reservations.requireDeposit}
                      onCheckedChange={(checked) => handleNestedChange("reservations", "requireDeposit", checked)}
                    />
                    <Label htmlFor="require-deposit">Require Deposit</Label>
                  </div>

                  {formState.reservations.requireDeposit && (
                    <div className="space-y-2">
                      <Label htmlFor="deposit-amount">Deposit Amount</Label>
                      <Input
                        id="deposit-amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formState.reservations.depositAmount}
                        onChange={(e) => handleNestedChange("reservations", "depositAmount", Number(e.target.value))}
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

