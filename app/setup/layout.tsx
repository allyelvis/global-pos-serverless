import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Setup - Global POS System",
  description: "Set up your Global POS System",
}

export default function SetupLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="mb-8 flex flex-col items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
          <span className="text-xl font-bold text-primary-foreground">POS</span>
        </div>
        <h1 className="mt-4 text-2xl font-bold">Global POS System Setup</h1>
        <p className="text-muted-foreground">Configure your POS system</p>
      </div>
      {children}
    </div>
  )
}

