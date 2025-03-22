"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { CalendarIcon, BarChart, LineChart, Loader2 } from "lucide-react"
import { AIService } from "@/lib/services/ai-service"
import { cn } from "@/lib/utils"
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart as RechartsBarChart,
  Bar,
} from "recharts"

interface SalesForecastProps {
  businessId: string
}

export function SalesForecast({ businessId }: SalesForecastProps) {
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(() => {
    const date = new Date()
    date.setDate(date.getDate() + 14) // Default to 14 days forecast
    return date
  })
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [forecastData, setForecastData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [chartType, setChartType] = useState<"line" | "bar">("line")

  const fetchForecastData = async () => {
    setIsLoading(true)
    try {
      const categories = selectedCategory !== "all" ? [selectedCategory] : undefined
      const data = await AIService.predictSales(businessId, startDate, endDate, categories)
      setForecastData(data)
    } catch (error) {
      console.error("Error fetching forecast data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchForecastData()
  }, [businessId])

  const handleDateRangeChange = (range: "week" | "month" | "quarter") => {
    const today = new Date()
    const newStartDate = new Date(today)
    const newEndDate = new Date(today)

    switch (range) {
      case "week":
        newEndDate.setDate(today.getDate() + 7)
        break
      case "month":
        newEndDate.setDate(today.getDate() + 30)
        break
      case "quarter":
        newEndDate.setDate(today.getDate() + 90)
        break
    }

    setStartDate(newStartDate)
    setEndDate(newEndDate)
  }

  const handleApplyDateRange = () => {
    fetchForecastData()
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>AI Sales Forecast</CardTitle>
        <CardDescription>
          Predictive sales forecasting powered by AI to help you plan inventory and staffing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(startDate, "PPP")} - {format(endDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="flex">
                    <div className="border-r p-2">
                      <div className="px-3 py-2 text-sm font-medium">Start Date</div>
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => date && setStartDate(date)}
                        initialFocus
                      />
                    </div>
                    <div className="p-2">
                      <div className="px-3 py-2 text-sm font-medium">End Date</div>
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => date && setEndDate(date)}
                        initialFocus
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 border-t p-3">
                    <Button size="sm" onClick={handleApplyDateRange}>
                      Apply Range
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleDateRangeChange("week")}>
                  Week
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDateRangeChange("month")}>
                  Month
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDateRangeChange("quarter")}>
                  Quarter
                </Button>
              </div>
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
                <SelectItem value="food">Food & Beverages</SelectItem>
                <SelectItem value="home">Home & Garden</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className={cn(chartType === "line" && "bg-primary text-primary-foreground")}
              onClick={() => setChartType("line")}
            >
              <LineChart className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={cn(chartType === "bar" && "bg-primary text-primary-foreground")}
              onClick={() => setChartType("bar")}
            >
              <BarChart className="h-4 w-4" />
            </Button>
            <Button onClick={fetchForecastData} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="chart">
          <TabsList className="mb-4">
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
          </TabsList>
          <TabsContent value="chart" className="space-y-4">
            <div className="h-[400px] w-full">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : forecastData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "line" ? (
                    <RechartsLineChart data={forecastData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        angle={-45}
                        textAnchor="end"
                        height={70}
                        tickFormatter={(value) => format(new Date(value), "MMM d")}
                      />
                      <YAxis tickFormatter={(value) => formatCurrency(value).replace(".00", "")} />
                      <Tooltip
                        formatter={(value: number) => [formatCurrency(value), "Predicted Sales"]}
                        labelFormatter={(value) => format(new Date(value), "EEEE, MMMM d, yyyy")}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="predictedSales"
                        name="Predicted Sales"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </RechartsLineChart>
                  ) : (
                    <RechartsBarChart data={forecastData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        angle={-45}
                        textAnchor="end"
                        height={70}
                        tickFormatter={(value) => format(new Date(value), "MMM d")}
                      />
                      <YAxis tickFormatter={(value) => formatCurrency(value).replace(".00", "")} />
                      <Tooltip
                        formatter={(value: number) => [formatCurrency(value), "Predicted Sales"]}
                        labelFormatter={(value) => format(new Date(value), "EEEE, MMMM d, yyyy")}
                      />
                      <Legend />
                      <Bar dataKey="predictedSales" name="Predicted Sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">No forecast data available</p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="table">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-2 text-left font-medium">Date</th>
                    <th className="p-2 text-left font-medium">Predicted Sales</th>
                    <th className="p-2 text-left font-medium">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                      </td>
                    </tr>
                  ) : forecastData.length > 0 ? (
                    forecastData.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                        <td className="p-2">{format(new Date(item.date), "EEE, MMM d, yyyy")}</td>
                        <td className="p-2">{formatCurrency(item.predictedSales)}</td>
                        <td className="p-2">{item.confidence * 100}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-muted-foreground">
                        No forecast data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

