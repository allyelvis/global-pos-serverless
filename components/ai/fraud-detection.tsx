"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2, AlertTriangle, ShieldCheck, ShieldAlert } from "lucide-react"
import { AIService } from "@/lib/services/ai-service"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

interface FraudDetectionProps {
  onDetectionResult?: (result: { isSuspicious: boolean; riskScore: number; reasons: string[] }) => void
}

export function FraudDetection({ onDetectionResult }: FraudDetectionProps) {
  const [transactionAmount, setTransactionAmount] = useState<number>(100)
  const [recentTransactions, setRecentTransactions] = useState<number>(1)
  const [isUnusualLocation, setIsUnusualLocation] = useState<boolean>(false)
  const [isUnusualPurchase, setIsUnusualPurchase] = useState<boolean>(false)
  const [timestamp, setTimestamp] = useState<string>(new Date().toISOString())

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [detectionResult, setDetectionResult] = useState<{
    isSuspicious: boolean
    riskScore: number
    reasons: string[]
  } | null>(null)

  const handleDetectFraud = async () => {
    setIsLoading(true)
    try {
      const transaction = {
        amount: transactionAmount,
        recentTransactions,
        isUnusualLocation,
        isUnusualPurchase,
        timestamp,
      }

      const result = await AIService.detectFraud(transaction)
      setDetectionResult(result)

      if (onDetectionResult) {
        onDetectionResult(result)
      }
    } catch (error) {
      console.error("Error detecting fraud:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRiskColor = (score: number) => {
    if (score < 20) return "bg-green-500"
    if (score < 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShieldAlert className="mr-2 h-5 w-5" />
          AI Fraud Detection
        </CardTitle>
        <CardDescription>Analyze transactions for potential fraud using AI</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="transaction-amount">Transaction Amount ($)</Label>
            <Input
              id="transaction-amount"
              type="number"
              min="0"
              step="0.01"
              value={transactionAmount}
              onChange={(e) => setTransactionAmount(Number.parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recent-transactions">Recent Transactions (24h)</Label>
            <Input
              id="recent-transactions"
              type="number"
              min="0"
              step="1"
              value={recentTransactions}
              onChange={(e) => setRecentTransactions(Number.parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex items-center space-x-2">
            <Switch id="unusual-location" checked={isUnusualLocation} onCheckedChange={setIsUnusualLocation} />
            <Label htmlFor="unusual-location">Unusual Location</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="unusual-purchase" checked={isUnusualPurchase} onCheckedChange={setIsUnusualPurchase} />
            <Label htmlFor="unusual-purchase">Unusual Purchase Pattern</Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="transaction-time">Transaction Time</Label>
          <Input
            id="transaction-time"
            type="datetime-local"
            value={timestamp.slice(0, 16)}
            onChange={(e) => setTimestamp(new Date(e.target.value).toISOString())}
          />
        </div>

        <Button onClick={handleDetectFraud} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Analyze Transaction
            </>
          )}
        </Button>

        {detectionResult && (
          <div className="mt-4 rounded-md border p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium">Analysis Result</h3>
              {detectionResult.isSuspicious ? (
                <div className="flex items-center text-red-500">
                  <AlertTriangle className="mr-1 h-5 w-5" />
                  <span className="font-medium">Suspicious</span>
                </div>
              ) : (
                <div className="flex items-center text-green-500">
                  <ShieldCheck className="mr-1 h-5 w-5" />
                  <span className="font-medium">Legitimate</span>
                </div>
              )}
            </div>

            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Risk Score:</span>
                <span className="font-bold">{detectionResult.riskScore}/100</span>
              </div>
              <Progress
                value={detectionResult.riskScore}
                max={100}
                className="h-2"
                indicatorClassName={getRiskColor(detectionResult.riskScore)}
              />
            </div>

            {detectionResult.reasons.length > 0 && (
              <>
                <Separator className="my-2" />
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Risk Factors:</h4>
                  <ul className="space-y-1 pl-5 text-sm">
                    {detectionResult.reasons.map((reason, index) => (
                      <li key={index} className="list-disc">
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        This AI-powered fraud detection system analyzes transaction patterns to identify potential fraud.
      </CardFooter>
    </Card>
  )
}

