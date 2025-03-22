"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { currencies, convertCurrency, getExchangeRate } from "@/lib/currency"
import { getBusinessById } from "@/lib/db/business"
import { getCurrentUser } from "@/lib/db/users"

export function CurrencyExchange() {
  const [amount, setAmount] = useState("100")
  const [fromCurrency, setFromCurrency] = useState("USD")
  const [toCurrency, setToCurrency] = useState("EUR")
  const [convertedAmount, setConvertedAmount] = useState(0)
  const [exchangeRate, setExchangeRate] = useState(0)
  const [businessCurrency, setBusinessCurrency] = useState("USD")

  useEffect(() => {
    const fetchBusinessCurrency = async () => {
      try {
        const user = await getCurrentUser()
        if (user) {
          const business = await getBusinessById(user.businessId)
          if (business) {
            setBusinessCurrency(business.currency)
            setFromCurrency(business.currency)
          }
        }
      } catch (error) {
        console.error("Failed to fetch business currency:", error)
      }
    }

    fetchBusinessCurrency()
  }, [])

  useEffect(() => {
    const rate = getExchangeRate(fromCurrency, toCurrency)
    setExchangeRate(rate)

    const converted = convertCurrency(Number.parseFloat(amount) || 0, fromCurrency, toCurrency)
    setConvertedAmount(converted)
  }, [amount, fromCurrency, toCurrency])

  const handleSwapCurrencies = () => {
    const temp = fromCurrency
    setFromCurrency(toCurrency)
    setToCurrency(temp)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Currency Exchange</CardTitle>
        <CardDescription>Convert between different currencies</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fromCurrency">From</Label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger id="fromCurrency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(currencies).map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name} ({currency.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <Button variant="outline" size="icon" onClick={handleSwapCurrencies}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M7 10h10l-3 -3" />
              <path d="M17 14h-10l3 3" />
            </svg>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="toCurrency">To</Label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger id="toCurrency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(currencies).map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name} ({currency.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="result">Result</Label>
            <Input
              id="result"
              value={convertedAmount.toFixed(currencies[toCurrency]?.decimalPlaces || 2)}
              readOnly
              className="bg-muted"
            />
          </div>
        </div>
        <div className="text-center text-sm text-muted-foreground">
          Exchange Rate: 1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <p className="text-sm text-muted-foreground">Rates updated daily</p>
        <Button variant="outline" size="sm">
          View All Rates
        </Button>
      </CardFooter>
    </Card>
  )
}

