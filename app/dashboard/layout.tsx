import type React from "react"
import { SideNav } from "@/components/side-nav"
import { TopNav } from "@/components/top-nav"
import { FallbackStorageNotice } from "@/components/fallback-storage-notice"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen flex-col">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <SideNav />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <FallbackStorageNotice />
          {children}
        </main>
      </div>
    </div>
  )
}

