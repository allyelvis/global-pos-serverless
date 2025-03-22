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
import { Slider } from "@/components/ui/slider"

interface IPAddress {
  id: string
  address: string
  description: string
}

interface SecuritySettings {
  passwordPolicy: {
    minLength: number
    requireUppercase: boolean
    requireLowercase: boolean
    requireNumbers: boolean
    requireSpecialChars: boolean
    passwordExpiryDays: number
    preventPasswordReuse: boolean
    previousPasswordsToCheck: number
  }
  loginSecurity: {
    maxLoginAttempts: number
    lockoutDuration: number
    requireCaptcha: boolean
    enableTwoFactor: boolean
    twoFactorMethod: string
  }
  sessionSecurity: {
    sessionTimeout: number
    enforceOneSessionPerUser: boolean
    requireReauthForSensitiveActions: boolean
    rememberMeDuration: number
  }
  ipSecurity: {
    enableIPWhitelist: boolean
    whitelistedIPs: IPAddress[]
    blockForeignIPs: boolean
  }
  dataProtection: {
    enableDataEncryption: boolean
    encryptionLevel: string
    enableDataBackup: boolean
    backupFrequency: string
    backupRetention: number
  }
  auditLogging: {
    enableAuditLogs: boolean
    logUserActions: boolean
    logSystemEvents: boolean
    logRetentionDays: number
  }
}

interface SecuritySettingsFormProps {
  settings: SecuritySettings
  onSave: (settings: SecuritySettings) => void
  isSaving: boolean
}

export default function SecuritySettingsForm({ settings, onSave, isSaving }: SecuritySettingsFormProps) {
  const [formState, setFormState] = useState<SecuritySettings>(settings)

  const handleNestedChange = (section: string, field: string, value: any) => {
    setFormState((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof SecuritySettings],
        [field]: value,
      },
    }))
  }

  const handleAddIP = () => {
    const newIP: IPAddress = {
      id: `ip-${Date.now()}`,
      address: "",
      description: "",
    }
    setFormState((prev) => ({
      ...prev,
      ipSecurity: {
        ...prev.ipSecurity,
        whitelistedIPs: [...prev.ipSecurity.whitelistedIPs, newIP],
      },
    }))
  }

  const handleRemoveIP = (id: string) => {
    setFormState((prev) => ({
      ...prev,
      ipSecurity: {
        ...prev.ipSecurity,
        whitelistedIPs: prev.ipSecurity.whitelistedIPs.filter((ip) => ip.id !== id),
      },
    }))
  }

  const handleUpdateIP = (id: string, field: string, value: string) => {
    setFormState((prev) => ({
      ...prev,
      ipSecurity: {
        ...prev.ipSecurity,
        whitelistedIPs: prev.ipSecurity.whitelistedIPs.map((ip) =>
          ip.id === id
            ? {
                ...ip,
                [field]: value,
              }
            : ip,
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
      <Accordion type="single" collapsible defaultValue="password-policy">
        <AccordionItem value="password-policy">
          <AccordionTrigger>Password Policy</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="min-length">Minimum Password Length: {formState.passwordPolicy.minLength}</Label>
                </div>
                <Slider
                  id="min-length"
                  min={6}
                  max={24}
                  step={1}
                  value={[formState.passwordPolicy.minLength]}
                  onValueChange={(value) => handleNestedChange("passwordPolicy", "minLength", value[0])}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="require-uppercase"
                    checked={formState.passwordPolicy.requireUppercase}
                    onCheckedChange={(checked) => handleNestedChange("passwordPolicy", "requireUppercase", checked)}
                  />
                  <Label htmlFor="require-uppercase">Require Uppercase Letters</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="require-lowercase"
                    checked={formState.passwordPolicy.requireLowercase}
                    onCheckedChange={(checked) => handleNestedChange("passwordPolicy", "requireLowercase", checked)}
                  />
                  <Label htmlFor="require-lowercase">Require Lowercase Letters</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="require-numbers"
                    checked={formState.passwordPolicy.requireNumbers}
                    onCheckedChange={(checked) => handleNestedChange("passwordPolicy", "requireNumbers", checked)}
                  />
                  <Label htmlFor="require-numbers">Require Numbers</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="require-special"
                    checked={formState.passwordPolicy.requireSpecialChars}
                    onCheckedChange={(checked) => handleNestedChange("passwordPolicy", "requireSpecialChars", checked)}
                  />
                  <Label htmlFor="require-special">Require Special Characters</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password-expiry">Password Expiry (days)</Label>
                <Input
                  id="password-expiry"
                  type="number"
                  min="0"
                  value={formState.passwordPolicy.passwordExpiryDays}
                  onChange={(e) => handleNestedChange("passwordPolicy", "passwordExpiryDays", Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">0 = Never Expire</p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="prevent-reuse"
                  checked={formState.passwordPolicy.preventPasswordReuse}
                  onCheckedChange={(checked) => handleNestedChange("passwordPolicy", "preventPasswordReuse", checked)}
                />
                <Label htmlFor="prevent-reuse">Prevent Password Reuse</Label>
              </div>

              {formState.passwordPolicy.preventPasswordReuse && (
                <div className="space-y-2">
                  <Label htmlFor="previous-passwords">Previous Passwords to Check</Label>
                  <Input
                    id="previous-passwords"
                    type="number"
                    min="1"
                    max="10"
                    value={formState.passwordPolicy.previousPasswordsToCheck}
                    onChange={(e) =>
                      handleNestedChange("passwordPolicy", "previousPasswordsToCheck", Number(e.target.value))
                    }
                  />
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="login-security">
          <AccordionTrigger>Login Security</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="max-attempts">Maximum Login Attempts</Label>
                  <Input
                    id="max-attempts"
                    type="number"
                    min="1"
                    value={formState.loginSecurity.maxLoginAttempts}
                    onChange={(e) => handleNestedChange("loginSecurity", "maxLoginAttempts", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lockout-duration">Lockout Duration (minutes)</Label>
                  <Input
                    id="lockout-duration"
                    type="number"
                    min="1"
                    value={formState.loginSecurity.lockoutDuration}
                    onChange={(e) => handleNestedChange("loginSecurity", "lockoutDuration", Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="require-captcha"
                  checked={formState.loginSecurity.requireCaptcha}
                  onCheckedChange={(checked) => handleNestedChange("loginSecurity", "requireCaptcha", checked)}
                />
                <Label htmlFor="require-captcha">Require CAPTCHA after Failed Attempts</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-2fa"
                  checked={formState.loginSecurity.enableTwoFactor}
                  onCheckedChange={(checked) => handleNestedChange("loginSecurity", "enableTwoFactor", checked)}
                />
                <Label htmlFor="enable-2fa">Enable Two-Factor Authentication</Label>
              </div>

              {formState.loginSecurity.enableTwoFactor && (
                <div className="space-y-2">
                  <Label htmlFor="2fa-method">Two-Factor Method</Label>
                  <Select
                    value={formState.loginSecurity.twoFactorMethod}
                    onValueChange={(value) => handleNestedChange("loginSecurity", "twoFactorMethod", value)}
                  >
                    <SelectTrigger id="2fa-method">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="app">Authenticator App</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="session-security">
          <AccordionTrigger>Session Security</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  min="1"
                  value={formState.sessionSecurity.sessionTimeout}
                  onChange={(e) => handleNestedChange("sessionSecurity", "sessionTimeout", Number(e.target.value))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="one-session"
                  checked={formState.sessionSecurity.enforceOneSessionPerUser}
                  onCheckedChange={(checked) =>
                    handleNestedChange("sessionSecurity", "enforceOneSessionPerUser", checked)
                  }
                />
                <Label htmlFor="one-session">Enforce One Session Per User</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="reauth-sensitive"
                  checked={formState.sessionSecurity.requireReauthForSensitiveActions}
                  onCheckedChange={(checked) =>
                    handleNestedChange("sessionSecurity", "requireReauthForSensitiveActions", checked)
                  }
                />
                <Label htmlFor="reauth-sensitive">Require Re-authentication for Sensitive Actions</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remember-me">Remember Me Duration (days)</Label>
                <Input
                  id="remember-me"
                  type="number"
                  min="1"
                  value={formState.sessionSecurity.rememberMeDuration}
                  onChange={(e) => handleNestedChange("sessionSecurity", "rememberMeDuration", Number(e.target.value))}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="ip-security">
          <AccordionTrigger>IP Security</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-whitelist"
                  checked={formState.ipSecurity.enableIPWhitelist}
                  onCheckedChange={(checked) => handleNestedChange("ipSecurity", "enableIPWhitelist", checked)}
                />
                <Label htmlFor="enable-whitelist">Enable IP Whitelist</Label>
              </div>

              {formState.ipSecurity.enableIPWhitelist && (
                <>
                  <div className="flex justify-end">
                    <Button type="button" onClick={handleAddIP} variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add IP Address
                    </Button>
                  </div>

                  {formState.ipSecurity.whitelistedIPs.map((ip) => (
                    <Card key={ip.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="mb-4 flex items-center justify-between">
                          <h4 className="text-lg font-medium">IP Address</h4>
                          <Button type="button" onClick={() => handleRemoveIP(ip.id)} variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor={`ip-address-${ip.id}`}>IP Address</Label>
                            <Input
                              id={`ip-address-${ip.id}`}
                              value={ip.address}
                              onChange={(e) => handleUpdateIP(ip.id, "address", e.target.value)}
                              placeholder="192.168.1.1"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`ip-description-${ip.id}`}>Description</Label>
                            <Input
                              id={`ip-description-${ip.id}`}
                              value={ip.description}
                              onChange={(e) => handleUpdateIP(ip.id, "description", e.target.value)}
                              placeholder="Office IP"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="block-foreign"
                  checked={formState.ipSecurity.blockForeignIPs}
                  onCheckedChange={(checked) => handleNestedChange("ipSecurity", "blockForeignIPs", checked)}
                />
                <Label htmlFor="block-foreign">Block Foreign IP Addresses</Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="data-protection">
          <AccordionTrigger>Data Protection</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-encryption"
                  checked={formState.dataProtection.enableDataEncryption}
                  onCheckedChange={(checked) => handleNestedChange("dataProtection", "enableDataEncryption", checked)}
                />
                <Label htmlFor="enable-encryption">Enable Data Encryption</Label>
              </div>

              {formState.dataProtection.enableDataEncryption && (
                <div className="space-y-2">
                  <Label htmlFor="encryption-level">Encryption Level</Label>
                  <Select
                    value={formState.dataProtection.encryptionLevel}
                    onValueChange={(value) => handleNestedChange("dataProtection", "encryptionLevel", value)}
                  >
                    <SelectTrigger id="encryption-level">
                      <SelectValue placeholder="Select encryption level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard (AES-128)</SelectItem>
                      <SelectItem value="high">High (AES-256)</SelectItem>
                      <SelectItem value="very-high">Very High (AES-256 with additional layers)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-backup"
                  checked={formState.dataProtection.enableDataBackup}
                  onCheckedChange={(checked) => handleNestedChange("dataProtection", "enableDataBackup", checked)}
                />
                <Label htmlFor="enable-backup">Enable Data Backup</Label>
              </div>

              {formState.dataProtection.enableDataBackup && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="backup-frequency">Backup Frequency</Label>
                    <Select
                      value={formState.dataProtection.backupFrequency}
                      onValueChange={(value) => handleNestedChange("dataProtection", "backupFrequency", value)}
                    >
                      <SelectTrigger id="backup-frequency">
                        <SelectValue placeholder="Select backup frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backup-retention">Backup Retention (days)</Label>
                    <Input
                      id="backup-retention"
                      type="number"
                      min="1"
                      value={formState.dataProtection.backupRetention}
                      onChange={(e) => handleNestedChange("dataProtection", "backupRetention", Number(e.target.value))}
                    />
                  </div>
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="audit-logging">
          <AccordionTrigger>Audit Logging</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-audit"
                  checked={formState.auditLogging.enableAuditLogs}
                  onCheckedChange={(checked) => handleNestedChange("auditLogging", "enableAuditLogs", checked)}
                />
                <Label htmlFor="enable-audit">Enable Audit Logs</Label>
              </div>

              {formState.auditLogging.enableAuditLogs && (
                <>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="log-user-actions"
                      checked={formState.auditLogging.logUserActions}
                      onCheckedChange={(checked) => handleNestedChange("auditLogging", "logUserActions", checked)}
                    />
                    <Label htmlFor="log-user-actions">Log User Actions</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="log-system-events"
                      checked={formState.auditLogging.logSystemEvents}
                      onCheckedChange={(checked) => handleNestedChange("auditLogging", "logSystemEvents", checked)}
                    />
                    <Label htmlFor="log-system-events">Log System Events</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="log-retention">Log Retention (days)</Label>
                    <Input
                      id="log-retention"
                      type="number"
                      min="1"
                      value={formState.auditLogging.logRetentionDays}
                      onChange={(e) => handleNestedChange("auditLogging", "logRetentionDays", Number(e.target.value))}
                    />
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

