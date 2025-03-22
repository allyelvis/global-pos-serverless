"use client"

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { name: "Clothing", value: 40 },
  { name: "Electronics", value: 30 },
  { name: "Accessories", value: 15 },
  { name: "Footwear", value: 10 },
  { name: "Other", value: 5 },
]

export function SalesByCategory() {
  return (
    <ChartContainer
      config={{
        Clothing: {
          label: "Clothing",
          color: "hsl(var(--chart-1))",
        },
        Electronics: {
          label: "Electronics",
          color: "hsl(var(--chart-2))",
        },
        Accessories: {
          label: "Accessories",
          color: "hsl(var(--chart-3))",
        },
        Footwear: {
          label: "Footwear",
          color: "hsl(var(--chart-4))",
        },
        Other: {
          label: "Other",
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
          <Tooltip content={<ChartTooltipContent formatValue={(value) => `${value}%`} />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

