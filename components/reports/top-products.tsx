"use client"

import { Progress } from "@/components/ui/progress"

const topProducts = [
  {
    name: "T-Shirt",
    category: "Clothing",
    sales: 245,
    revenue: 4895.55,
  },
  {
    name: "Smartphone",
    category: "Electronics",
    sales: 132,
    revenue: 79198.68,
  },
  {
    name: "Sneakers",
    category: "Footwear",
    sales: 112,
    revenue: 8958.88,
  },
  {
    name: "Headphones",
    category: "Electronics",
    sales: 89,
    revenue: 8009.11,
  },
  {
    name: "Watch",
    category: "Accessories",
    sales: 76,
    revenue: 9879.24,
  },
]

export function TopProducts() {
  const maxSales = Math.max(...topProducts.map((product) => product.sales))

  return (
    <div className="space-y-4">
      {topProducts.map((product) => (
        <div key={product.name} className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-muted-foreground">{product.category}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">${product.revenue.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">{product.sales} units</p>
            </div>
          </div>
          <Progress value={(product.sales / maxSales) * 100} className="h-2" />
        </div>
      ))}
    </div>
  )
}

