"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface HotelSettings {
  roomManagement: {
    enableRoomManagement: boolean
    showRoomStatus: boolean
    autoAssignRooms: boolean
  }
  checkInOut: {
    standardCheckInTime: string
    standardCheckOutTime: string
    allowEarlyCheckIn: boolean
    allowLateCheckOut: boolean
    earlyCheckInFee: number
    lateCheckOutFee: number
  }
  reservations: {
    allowOnlineReservations: boolean
    requireDeposit: boolean
    depositPercentage: number
    cancellationPolicyDays: number
    cancellationFee: number
  }
  guestServices: {
    enableRoomService: boolean
    enableHousekeeping: boolean
    enableConcierge: boolean
    enableMiniBar: boolean
  }
  billing: {
    chargePerRoom: boolean
    chargePerGuest: boolean
    allowRoomCharges: boolean
    requireCreditCardOnFile: boolean
  }
}

interface HotelSettingsFormProps {
  settings: HotelSettings
  onSave: (settings: HotelSettings) => void
  isSaving: boolean
}

export default function HotelSettingsForm({ settings, onSave, isSaving }: HotelSettingsFormProps) {
  const [formState, setFormState] = useState<HotelSettings>(settings)

  const handleNestedChange = (section: string, field: string, value: any) => {
    setFormState((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof HotelSettings],
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
      <Accordion type="single" collapsible defaultValue="room-management">
        <AccordionItem value="room-management">
          <AccordionTrigger>Room Management</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-room-management"
                  checked={formState.roomManagement.enableRoomManagement}
                  onCheckedChange={(checked) => handleNestedChange("roomManagement", "enableRoomManagement", checked)}
                />
                <Label htmlFor="enable-room-management">Enable Room Management</Label>
              </div>

              {formState.roomManagement.enableRoomManagement && (
                <>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-room-status"
                      checked={formState.roomManagement.showRoomStatus}
                      onCheckedChange={(checked) => handleNestedChange("roomManagement", "showRoomStatus", checked)}
                    />
                    <Label htmlFor="show-room-status">Show Room Status</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-assign-rooms"
                      checked={formState.roomManagement.autoAssignRooms}
                      onCheckedChange={(checked) => handleNestedChange("roomManagement", "autoAssignRooms", checked)}
                    />
                    <Label htmlFor="auto-assign-rooms">Auto-Assign Rooms</Label>
                  </div>
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="check-in-out">
          <AccordionTrigger>Check-In/Check-Out</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="check-in-time">Standard Check-In Time</Label>
                  <Input
                    id="check-in-time"
                    type="time"
                    value={formState.checkInOut.standardCheckInTime}
                    onChange={(e) => handleNestedChange("checkInOut", "standardCheckInTime", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="check-out-time">Standard Check-Out Time</Label>
                  <Input
                    id="check-out-time"
                    type="time"
                    value={formState.checkInOut.standardCheckOutTime}
                    onChange={(e) => handleNestedChange("checkInOut", "standardCheckOutTime", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="early-check-in"
                  checked={formState.checkInOut.allowEarlyCheckIn}
                  onCheckedChange={(checked) => handleNestedChange("checkInOut", "allowEarlyCheckIn", checked)}
                />
                <Label htmlFor="early-check-in">Allow Early Check-In</Label>
              </div>

              {formState.checkInOut.allowEarlyCheckIn && (
                <div className="space-y-2">
                  <Label htmlFor="early-check-in-fee">Early Check-In Fee</Label>
                  <Input
                    id="early-check-in-fee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formState.checkInOut.earlyCheckInFee}
                    onChange={(e) => handleNestedChange("checkInOut", "earlyCheckInFee", Number(e.target.value))}
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="late-check-out"
                  checked={formState.checkInOut.allowLateCheckOut}
                  onCheckedChange={(checked) => handleNestedChange("checkInOut", "allowLateCheckOut", checked)}
                />
                <Label htmlFor="late-check-out">Allow Late Check-Out</Label>
              </div>

              {formState.checkInOut.allowLateCheckOut && (
                <div className="space-y-2">
                  <Label htmlFor="late-check-out-fee">Late Check-Out Fee</Label>
                  <Input
                    id="late-check-out-fee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formState.checkInOut.lateCheckOutFee}
                    onChange={(e) => handleNestedChange("checkInOut", "lateCheckOutFee", Number(e.target.value))}
                  />
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="reservations">
          <AccordionTrigger>Reservations</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="online-reservations"
                  checked={formState.reservations.allowOnlineReservations}
                  onCheckedChange={(checked) => handleNestedChange("reservations", "allowOnlineReservations", checked)}
                />
                <Label htmlFor="online-reservations">Allow Online Reservations</Label>
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
                  <Label htmlFor="deposit-percentage">Deposit Percentage (%)</Label>
                  <Input
                    id="deposit-percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={formState.reservations.depositPercentage}
                    onChange={(e) => handleNestedChange("reservations", "depositPercentage", Number(e.target.value))}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="cancellation-days">Cancellation Policy (days before arrival)</Label>
                <Input
                  id="cancellation-days"
                  type="number"
                  min="0"
                  value={formState.reservations.cancellationPolicyDays}
                  onChange={(e) => handleNestedChange("reservations", "cancellationPolicyDays", Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cancellation-fee">Cancellation Fee</Label>
                <Input
                  id="cancellation-fee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.reservations.cancellationFee}
                  onChange={(e) => handleNestedChange("reservations", "cancellationFee", Number(e.target.value))}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="guest-services">
          <AccordionTrigger>Guest Services</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-room-service"
                  checked={formState.guestServices.enableRoomService}
                  onCheckedChange={(checked) => handleNestedChange("guestServices", "enableRoomService", checked)}
                />
                <Label htmlFor="enable-room-service">Enable Room Service</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-housekeeping"
                  checked={formState.guestServices.enableHousekeeping}
                  onCheckedChange={(checked) => handleNestedChange("guestServices", "enableHousekeeping", checked)}
                />
                <Label htmlFor="enable-housekeeping">Enable Housekeeping</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-concierge"
                  checked={formState.guestServices.enableConcierge}
                  onCheckedChange={(checked) => handleNestedChange("guestServices", "enableConcierge", checked)}
                />
                <Label htmlFor="enable-concierge">Enable Concierge</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-mini-bar"
                  checked={formState.guestServices.enableMiniBar}
                  onCheckedChange={(checked) => handleNestedChange("guestServices", "enableMiniBar", checked)}
                />
                <Label htmlFor="enable-mini-bar">Enable Mini Bar</Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="billing">
          <AccordionTrigger>Billing</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="charge-per-room"
                  checked={formState.billing.chargePerRoom}
                  onCheckedChange={(checked) => handleNestedChange("billing", "chargePerRoom", checked)}
                />
                <Label htmlFor="charge-per-room">Charge Per Room</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="charge-per-guest"
                  checked={formState.billing.chargePerGuest}
                  onCheckedChange={(checked) => handleNestedChange("billing", "chargePerGuest", checked)}
                />
                <Label htmlFor="charge-per-guest">Charge Per Guest</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="allow-room-charges"
                  checked={formState.billing.allowRoomCharges}
                  onCheckedChange={(checked) => handleNestedChange("billing", "allowRoomCharges", checked)}
                />
                <Label htmlFor="allow-room-charges">Allow Room Charges</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="require-credit-card"
                  checked={formState.billing.requireCreditCardOnFile}
                  onCheckedChange={(checked) => handleNestedChange("billing", "requireCreditCardOnFile", checked)}
                />
                <Label htmlFor="require-credit-card">Require Credit Card on File</Label>
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

