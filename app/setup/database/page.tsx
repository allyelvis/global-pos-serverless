"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { testRedisConnection } from "@/lib/db/redis-client"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function DatabaseSetupPage() {
  const [redisToken, setRedisToken] = useState("")
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<boolean | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()

  const testConnection = async () => {
    setTesting(true)
    setTestResult(null)
    setErrorMessage(null)

    try {
      // In a real app, you'd send this to an API endpoint
      // For demo purposes, we're using the client-side function
      // This would normally be a server action
      const result = await testRedisConnection()
      setTestResult(result)

      if (!result) {
        setErrorMessage("Connection failed. Please check your Redis token.")
      }
    } catch (error) {
      setTestResult(false)
      setErrorMessage(error instanceof Error ? error.message : "Unknown error occurred")
    } finally {
      setTesting(false)
    }
  }

  const saveAndContinue = async () => {
    // In a real app, you'd save this to an environment variable or secure storage
    // For demo purposes, we're just navigating forward
    // This would normally be a server action

    // Simulate saving
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Navigate to next step
    router.push("/setup/business")
  }

  return (
    <div className="container max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>Database Configuration</CardTitle>
          <CardDescription>Configure your Redis database connection for the POS system.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="redis-token">Redis Token</Label>
            <Input
              id="redis-token"
              type="password"
              placeholder="Enter your Redis token"
              value={redisToken}
              onChange={(e) => setRedisToken(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">You can get this from your Upstash Redis dashboard.</p>
          </div>

          <Button variant="outline" onClick={testConnection} disabled={!redisToken || testing} className="w-full">
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing Connection
              </>
            ) : (
              "Test Connection"
            )}
          </Button>

          {testResult !== null && (
            <div className={`p-3 rounded-md ${testResult ? "bg-green-50" : "bg-red-50"}`}>
              <div className="flex items-center gap-2">
                {testResult ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <p className="text-sm text-green-700">Connection successful!</p>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <p className="text-sm text-red-700">
                      {errorMessage || "Connection failed. Please check your Redis token."}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={() => router.push("/setup")}>
              Back
            </Button>
            <Button onClick={saveAndContinue} disabled={!redisToken || testResult === false}>
              Save and Continue
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

