"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Database, RefreshCw, Shield } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { getVersionInfo } from "@/lib/version"

export default function DatabaseManagementPage() {
  const [isRebuilding, setIsRebuilding] = useState(false)
  const [forceRebuild, setForceRebuild] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string }>({})
  const { toast } = useToast()
  const version = getVersionInfo()

  const handleRebuildDatabase = async () => {
    if (!confirm("Are you sure you want to rebuild the database? This will delete all existing data.")) {
      return
    }

    try {
      setIsRebuilding(true)
      setResult({})

      const response = await fetch("/api/admin/rebuild-database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`, // In a real app, use a proper auth system
        },
        body: JSON.stringify({ force: forceRebuild }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, message: data.message })
        toast({
          title: "Database Rebuilt",
          description: "The database has been successfully rebuilt.",
          variant: "default",
        })
      } else {
        setResult({ success: false, message: data.message || "An error occurred" })
        toast({
          title: "Error",
          description: data.message || "Failed to rebuild database",
          variant: "destructive",
        })
      }
    } catch (error) {
      setResult({ success: false, message: (error as Error).message })
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsRebuilding(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Database Management</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Information
            </CardTitle>
            <CardDescription>View and manage your database settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="font-medium">System Version:</div>
                <div>{version.build}</div>

                <div className="font-medium">Release Date:</div>
                <div>{version.releaseDate}</div>

                <div className="font-medium">Database Type:</div>
                <div>Redis</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Shield className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>These actions can result in data loss</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Rebuilding the database will delete all existing data and reset to default values. This action cannot be
                undone.
              </AlertDescription>
            </Alert>

            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="force-rebuild"
                checked={forceRebuild}
                onCheckedChange={(checked) => setForceRebuild(checked as boolean)}
              />
              <label
                htmlFor="force-rebuild"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Force rebuild in production
              </label>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="destructive" onClick={handleRebuildDatabase} disabled={isRebuilding} className="w-full">
              {isRebuilding ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Rebuilding...
                </>
              ) : (
                "Rebuild Database"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {result.message && (
        <Alert variant={result.success ? "default" : "destructive"} className="mt-6">
          <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

