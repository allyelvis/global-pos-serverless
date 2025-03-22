"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  {
    name: "Jan",
    total: 1800,
  },
  {
    name: "Feb",
    total: 2200,
  },
  {
    name: "Mar",
    total: 2800,
  },
  {
    name: "Apr",
    total: 2400,
  },
  {
    name: "May",
    total: 2900,
  },
  {
    name: "Jun",
    total: 3300,
  },
  {
    name: "Jul",
    total: 3200,
  },
  {
    name: "Aug",
    total: 3500,
  },
  {
    name: "Sep",
    total: 3800,
  },
  {
    name: "Oct",
    total: 3900,
  },
  {
    name: "Nov",
    total: 4200,
  },
  {
    name: "Dec",
    total: 4600,
  },
]

export function SalesTrend() {
  return (
    <ChartContainer
      config={{
        total: {
          label: "Revenue",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} fontSize={12} />
          <ChartTooltip content={<ChartTooltipContent formatValue={(value) => `$${value}`} />} />
          <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

