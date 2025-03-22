"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

interface VercelDeploymentBadgeProps {
  projectName?: string
}

export function VercelDeploymentBadge({ projectName = "global-pos" }: VercelDeploymentBadgeProps) {
  const [deploymentUrl, setDeploymentUrl] = useState("")

  useEffect(() => {
    // Check if we're running on Vercel
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname
      if (hostname.includes("vercel.app")) {
        setDeploymentUrl(`https://${hostname}`)
      }
    }
  }, [])

  return (
    <div className="flex items-center gap-2 rounded-md border bg-card p-2 text-sm">
      <div className="flex items-center gap-1.5">
        <div className="flex h-2 w-2 rounded-full bg-green-500" />
        <span>Deployed on Vercel</span>
      </div>
      {deploymentUrl && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 gap-1 px-2 text-xs"
          onClick={() => window.open(`https://vercel.com/dashboard`, "_blank")}
        >
          <span>Dashboard</span>
          <ExternalLink className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}

