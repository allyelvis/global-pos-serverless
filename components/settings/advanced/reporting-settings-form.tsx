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
import { Checkbox } from "@/components/ui/checkbox"

interface ScheduledReport {
  id: string
  name: string
  type: string
  frequency: string
  format: string
  recipients: string[]
  enabled: boolean
}

interface ReportingSettings {
  dashboardSettings: {
    refreshInterval: number
    defaultDateRange: string
    showSalesGraph: boolean
    showInventoryStatus: boolean
    showTopProducts: boolean
    showRecentOrders: boolean
  }
  salesReporting: {
    enableSalesReports: boolean
    includeTaxInReports: boolean
    includeDiscountsInReports: boolean
    trackSalesByEmployee: boolean
    trackSalesByLocation: boolean
  }
  inventoryReporting: {
    enableInventoryReports: boolean
    trackStockLevels: boolean
    trackInventoryValue: boolean
    trackInventoryMovement: boolean
    alertLowStock: boolean
  }
  customerReporting: {
    enableCustomerReports: boolean
    trackCustomerSpending: boolean
    trackCustomerVisits: boolean
    trackCustomerAcquisition: boolean
    enableCustomerSegmentation: boolean
  }
  scheduledReports: ScheduledReport[]
  exportOptions: {
    enableExport: boolean
    availableFormats: string[]
    includeHeadersInExport: boolean
    enableScheduledExports: boolean
  }
}

interface ReportingSettingsFormProps {
  settings: ReportingSettings
  onSave: (settings: ReportingSettings) => void
  isSaving: boolean
}

export default function ReportingSettingsForm({ settings, onSave, isSaving }: ReportingSettingsFormProps) {
  const [formState, setFormState] = useState<ReportingSettings>(settings)
  const [newRecipient, setNewRecipient] = useState<string>("")
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)

  const handleNestedChange = (section: string, field: string, value: any) => {
    setFormState((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof ReportingSettings],
        [field]: value,
      },
    }))
  }

  const handleExportFormatChange = (format: string, checked: boolean) => {
    setFormState((prev) => {
      const currentFormats = prev.exportOptions.availableFormats
      const updatedFormats = checked ? [...currentFormats, format] : currentFormats.filter((f) => f !== format)

      return {
        ...prev,
        exportOptions: {
          ...prev.exportOptions,
          availableFormats: updatedFormats,
        },
      }
    })
  }

  const handleAddScheduledReport = () => {
    const newReport: ScheduledReport = {
      id: `report-${Date.now()}`,
      name: "New Scheduled Report",
      type: "sales",
      frequency: "weekly",
      format: "pdf",
      recipients: [],
      enabled: true,
    }
    setFormState((prev) => ({
      ...prev,
      scheduledReports: [...prev.scheduledReports, newReport],
    }))
  }

  const handleRemoveScheduledReport = (id: string) => {
    setFormState((prev) => ({
      ...prev,
      scheduledReports: prev.scheduledReports.filter((report) => report.id !== id),
    }))
  }

  const handleUpdateScheduledReport = (id: string, field: string, value: any) => {
    setFormState((prev) => ({
      ...prev,
      scheduledReports: prev.scheduledReports.map((report) =>
        report.id === id
          ? {
              ...report,
              [field]: value,
            }
          : report,
      ),
    }))
  }

  const handleAddRecipient = (reportId: string) => {
    if (newRecipient.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newRecipient)) {
      setFormState((prev) => ({
        ...prev,
        scheduledReports: prev.scheduledReports.map((report) =>
          report.id === reportId
            ? {
                ...report,
                recipients: [...report.recipients, newRecipient.trim()],
              }
            : report,
        ),
      }))
      setNewRecipient("")
    }
  }

  const handleRemoveRecipient = (reportId: string, email: string) => {
    setFormState((prev) => ({
      ...prev,
      scheduledReports: prev.scheduledReports.map((report) =>
        report.id === reportId
          ? {
              ...report,
              recipients: report.recipients.filter((r) => r !== email),
            }
          : report,
      ),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formState)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Accordion type="single" collapsible defaultValue="dashboard-settings">
        <AccordionItem value="dashboard-settings">
          <AccordionTrigger>Dashboard Settings</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="refresh-interval">Dashboard Refresh Interval (minutes)</Label>
                <Select
                  value={formState.dashboardSettings.refreshInterval.toString()}
                  onValueChange={(value) => handleNestedChange("dashboardSettings", "refreshInterval", Number(value))}
                >
                  <SelectTrigger id="refresh-interval">
                    <SelectValue placeholder="Select refresh interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 minute</SelectItem>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-date-range">Default Date Range</Label>
                <Select
                  value={formState.dashboardSettings.defaultDateRange}
                  onValueChange={(value) => handleNestedChange("dashboardSettings", "defaultDateRange", value)}
                >
                  <SelectTrigger id="default-date-range">
                    <SelectValue placeholder="Select default date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="this-week">This Week</SelectItem>
                    <SelectItem value="last-week">Last Week</SelectItem>
                    <SelectItem value="this-month">This Month</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="this-year">This Year</SelectItem>
                    <SelectItem value="last-year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Dashboard Widgets</Label>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-sales-graph"
                      checked={formState.dashboardSettings.showSalesGraph}
                      onCheckedChange={(checked) => handleNestedChange("dashboardSettings", "showSalesGraph", checked)}
                    />
                    <Label htmlFor="show-sales-graph">Show Sales Graph</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-inventory-status"
                      checked={formState.dashboardSettings.showInventoryStatus}
                      onCheckedChange={(checked) =>
                        handleNestedChange("dashboardSettings", "showInventoryStatus", checked)
                      }
                    />
                    <Label htmlFor="show-inventory-status">Show Inventory Status</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-top-products"
                      checked={formState.dashboardSettings.showTopProducts}
                      onCheckedChange={(checked) => handleNestedChange("dashboardSettings", "showTopProducts", checked)}
                    />
                    <Label htmlFor="show-top-products">Show Top Products</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-recent-orders"
                      checked={formState.dashboardSettings.showRecentOrders}
                      onCheckedChange={(checked) =>
                        handleNestedChange("dashboardSettings", "showRecentOrders", checked)
                      }
                    />
                    <Label htmlFor="show-recent-orders">Show Recent Orders</Label>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="sales-reporting">
          <AccordionTrigger>Sales Reporting</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-sales-reports"
                  checked={formState.salesReporting.enableSalesReports}
                  onCheckedChange={(checked) => handleNestedChange("salesReporting", "enableSalesReports", checked)}
                />
                <Label htmlFor="enable-sales-reports">Enable Sales Reports</Label>
              </div>

              {formState.salesReporting.enableSalesReports && (
                <>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="include-tax"
                        checked={formState.salesReporting.includeTaxInReports}
                        onCheckedChange={(checked) =>
                          handleNestedChange("salesReporting", "includeTaxInReports", checked)
                        }
                      />
                      <Label htmlFor="include-tax">Include Tax in Reports</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="include-discounts"
                        checked={formState.salesReporting.includeDiscountsInReports}
                        onCheckedChange={(checked) =>
                          handleNestedChange("salesReporting", "includeDiscountsInReports", checked)
                        }
                      />
                      <Label htmlFor="include-discounts">Include Discounts in Reports</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="track-by-employee"
                        checked={formState.salesReporting.trackSalesByEmployee}
                        onCheckedChange={(checked) =>
                          handleNestedChange("salesReporting", "trackSalesByEmployee", checked)
                        }
                      />
                      <Label htmlFor="track-by-employee">Track Sales by Employee</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="track-by-location"
                        checked={formState.salesReporting.trackSalesByLocation}
                        onCheckedChange={(checked) =>
                          handleNestedChange("salesReporting", "trackSalesByLocation", checked)
                        }
                      />
                      <Label htmlFor="track-by-location">Track Sales by Location</Label>
                    </div>
                  </div>
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="inventory-reporting">
          <AccordionTrigger>Inventory Reporting</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-inventory-reports"
                  checked={formState.inventoryReporting.enableInventoryReports}
                  onCheckedChange={(checked) =>
                    handleNestedChange("inventoryReporting", "enableInventoryReports", checked)
                  }
                />
                <Label htmlFor="enable-inventory-reports">Enable Inventory Reports</Label>
              </div>

              {formState.inventoryReporting.enableInventoryReports && (
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="track-stock-levels"
                      checked={formState.inventoryReporting.trackStockLevels}
                      onCheckedChange={(checked) =>
                        handleNestedChange("inventoryReporting", "trackStockLevels", checked)
                      }
                    />
                    <Label htmlFor="track-stock-levels">Track Stock Levels</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="track-inventory-value"
                      checked={formState.inventoryReporting.trackInventoryValue}
                      onCheckedChange={(checked) =>
                        handleNestedChange("inventoryReporting", "trackInventoryValue", checked)
                      }
                    />
                    <Label htmlFor="track-inventory-value">Track Inventory Value</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="track-inventory-movement"
                      checked={formState.inventoryReporting.trackInventoryMovement}
                      onCheckedChange={(checked) =>
                        handleNestedChange("inventoryReporting", "trackInventoryMovement", checked)
                      }
                    />
                    <Label htmlFor="track-inventory-movement">Track Inventory Movement</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="alert-low-stock"
                      checked={formState.inventoryReporting.alertLowStock}
                      onCheckedChange={(checked) => handleNestedChange("inventoryReporting", "alertLowStock", checked)}
                    />
                    <Label htmlFor="alert-low-stock">Alert Low Stock</Label>
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="customer-reporting">
          <AccordionTrigger>Customer Reporting</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-customer-reports"
                  checked={formState.customerReporting.enableCustomerReports}
                  onCheckedChange={(checked) =>
                    handleNestedChange("customerReporting", "enableCustomerReports", checked)
                  }
                />
                <Label htmlFor="enable-customer-reports">Enable Customer Reports</Label>
              </div>

              {formState.customerReporting.enableCustomerReports && (
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="track-customer-spending"
                      checked={formState.customerReporting.trackCustomerSpending}
                      onCheckedChange={(checked) =>
                        handleNestedChange("customerReporting", "trackCustomerSpending", checked)
                      }
                    />
                    <Label htmlFor="track-customer-spending">Track Customer Spending</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="track-customer-visits"
                      checked={formState.customerReporting.trackCustomerVisits}
                      onCheckedChange={(checked) =>
                        handleNestedChange("customerReporting", "trackCustomerVisits", checked)
                      }
                    />
                    <Label htmlFor="track-customer-visits">Track Customer Visits</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="track-customer-acquisition"
                      checked={formState.customerReporting.trackCustomerAcquisition}
                      onCheckedChange={(checked) =>
                        handleNestedChange("customerReporting", "trackCustomerAcquisition", checked)
                      }
                    />
                    <Label htmlFor="track-customer-acquisition">Track Customer Acquisition</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enable-customer-segmentation"
                      checked={formState.customerReporting.enableCustomerSegmentation}
                      onCheckedChange={(checked) =>
                        handleNestedChange("customerReporting", "enableCustomerSegmentation", checked)
                      }
                    />
                    <Label htmlFor="enable-customer-segmentation">Enable Customer Segmentation</Label>
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="scheduled-reports">
          <AccordionTrigger>Scheduled Reports</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button type="button" onClick={handleAddScheduledReport} variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Scheduled Report
                </Button>
              </div>

              {formState.scheduledReports.map((report) => (
                <Card key={report.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-lg font-medium">{report.name}</h4>
                      <Button
                        type="button"
                        onClick={() => handleRemoveScheduledReport(report.id)}
                        variant="ghost"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`report-name-${report.id}`}>Report Name</Label>
                        <Input
                          id={`report-name-${report.id}`}
                          value={report.name}
                          onChange={(e) => handleUpdateScheduledReport(report.id, "name", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`report-type-${report.id}`}>Report Type</Label>
                        <Select
                          value={report.type}
                          onValueChange={(value) => handleUpdateScheduledReport(report.id, "type", value)}
                        >
                          <SelectTrigger id={`report-type-${report.id}`}>
                            <SelectValue placeholder="Select report type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sales">Sales Report</SelectItem>
                            <SelectItem value="inventory">Inventory Report</SelectItem>
                            <SelectItem value="customer">Customer Report</SelectItem>
                            <SelectItem value="employee">Employee Report</SelectItem>
                            <SelectItem value="tax">Tax Report</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`report-frequency-${report.id}`}>Frequency</Label>
                        <Select
                          value={report.frequency}
                          onValueChange={(value) => handleUpdateScheduledReport(report.id, "frequency", value)}
                        >
                          <SelectTrigger id={`report-frequency-${report.id}`}>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="annually">Annually</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`report-format-${report.id}`}>Format</Label>
                        <Select
                          value={report.format}
                          onValueChange={(value) => handleUpdateScheduledReport(report.id, "format", value)}
                        >
                          <SelectTrigger id={`report-format-${report.id}`}>
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="csv">CSV</SelectItem>
                            <SelectItem value="excel">Excel</SelectItem>
                            <SelectItem value="json">JSON</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <Label>Recipients</Label>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Email address"
                          value={selectedReportId === report.id ? newRecipient : ""}
                          onChange={(e) => {
                            setSelectedReportId(report.id)
                            setNewRecipient(e.target.value)
                          }}
                          onFocus={() => setSelectedReportId(report.id)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleAddRecipient(report.id)}
                          disabled={!newRecipient.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newRecipient)}
                        >
                          Add
                        </Button>
                      </div>
                      <div className="mt-2 space-y-1">
                        {report.recipients.map((email) => (
                          <div key={email} className="flex items-center justify-between rounded bg-muted p-2 text-sm">
                            <span>{email}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveRecipient(report.id, email)}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center space-x-2">
                      <Switch
                        id={`report-enabled-${report.id}`}
                        checked={report.enabled}
                        onCheckedChange={(checked) => handleUpdateScheduledReport(report.id, "enabled", checked)}
                      />
                      <Label htmlFor={`report-enabled-${report.id}`}>Enabled</Label>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="export-options">
          <AccordionTrigger>Export Options</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-export"
                  checked={formState.exportOptions.enableExport}
                  onCheckedChange={(checked) => handleNestedChange("exportOptions", "enableExport", checked)}
                />
                <Label htmlFor="enable-export">Enable Export</Label>
              </div>

              {formState.exportOptions.enableExport && (
                <>
                  <div className="space-y-2">
                    <Label>Available Export Formats</Label>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="format-pdf"
                          checked={formState.exportOptions.availableFormats.includes("pdf")}
                          onCheckedChange={(checked) => handleExportFormatChange("pdf", checked === true)}
                        />
                        <Label htmlFor="format-pdf">PDF</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="format-csv"
                          checked={formState.exportOptions.availableFormats.includes("csv")}
                          onCheckedChange={(checked) => handleExportFormatChange("csv", checked === true)}
                        />
                        <Label htmlFor="format-csv">CSV</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="format-excel"
                          checked={formState.exportOptions.availableFormats.includes("excel")}
                          onCheckedChange={(checked) => handleExportFormatChange("excel", checked === true)}
                        />
                        <Label htmlFor="format-excel">Excel</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="format-json"
                          checked={formState.exportOptions.availableFormats.includes("json")}
                          onCheckedChange={(checked) => handleExportFormatChange("json", checked === true)}
                        />
                        <Label htmlFor="format-json">JSON</Label>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="include-headers"
                      checked={formState.exportOptions.includeHeadersInExport}
                      onCheckedChange={(checked) =>
                        handleNestedChange("exportOptions", "includeHeadersInExport", checked)
                      }
                    />
                    <Label htmlFor="include-headers">Include Headers in Export</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enable-scheduled-exports"
                      checked={formState.exportOptions.enableScheduledExports}
                      onCheckedChange={(checked) =>
                        handleNestedChange("exportOptions", "enableScheduledExports", checked)
                      }
                    />
                    <Label htmlFor="enable-scheduled-exports">Enable Scheduled Exports</Label>
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

