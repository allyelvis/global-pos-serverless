"use client"

import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { name: "Retail", value: 40 },
  { name: "Restaurant", value: 30 },
  { name: "Salon", value: 15 },
  { name: "Hotel", value: 10 },
  { name: "Grocery", value: 5 },
]

export function SalesBySector() {
  return (
    <ChartContainer
      config={{
        Retail: {
          label: "Retail",
          color: "hsl(var(--chart-1))",
        },
        Restaurant: {
          label: "Restaurant",
          color: "hsl(var(--chart-2))",
        },
        Salon: {
          label: "Salon",
          color: "hsl(var(--chart-3))",
        },
        Hotel: {
          label: "Hotel",
          color: "hsl(var(--chart-4))",
        },
        Grocery: {
          label: "Grocery",
          color: "hsl(var(--chart-5))",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={`var(--color-${entry.name})`} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent formatValue={(value) => `${value}%`} />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

