import type { Metadata } from "next"
import { FiscalComplianceSettings } from "@/components/settings/fiscal-compliance-settings"

export const metadata: Metadata = {
  title: "Fiscal Compliance Settings",
  description: "Configure fiscal compliance settings for different regions",
}

export default function FiscalCompliancePage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Fiscal Compliance Settings</h1>
        <p className="text-muted-foreground">
          Configure fiscal compliance settings for different regions and tax rules
        </p>
      </div>

      <FiscalComplianceSettings />
    </div>
  )
}

