"use client"

import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { name: "New Customers", value: 35 },
  { name: "Returning Customers", value: 65 },
]

export function CustomerStats() {
  return (
    <ChartContainer
      config={{
        "New Customers": {
          label: "New Customers",
          color: "hsl(var(--chart-1))",
        },
        "Returning Customers": {
          label: "Returning Customers",
          color: "hsl(var(--chart-2))",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={`var(--color-${entry.name.replace(" ", "")})`} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent formatValue={(value) => `${value}%`} />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

