import type { Metadata } from "next"
import { HealthDashboard } from "@/components/system/health-dashboard"

export const metadata: Metadata = {
  title: "System Health | Global POS",
  description: "Monitor the health and performance of your POS system",
}

export default function SystemHealthPage() {
  return (
    <div className="container mx-auto py-6">
      <HealthDashboard />
    </div>
  )
}

