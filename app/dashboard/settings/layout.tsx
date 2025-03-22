import type React from "react"
import type { Metadata } from "next"
import { SettingsNavigation } from "@/components/settings/settings-navigation"

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your POS system settings and preferences.",
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-8 lg:space-y-0">
      <aside className="lg:w-1/5">
        <div className="sticky top-16">
          <SettingsNavigation />
        </div>
      </aside>
      <div className="flex-1 lg:max-w-4xl">{children}</div>
    </div>
  )
}

