"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Settings,
  Store,
  Users,
  Package,
  Tag,
  Users2,
  Receipt,
  BarChart,
  Plug,
  Shield,
  Laptop,
  ChevronRight,
} from "lucide-react"

export function SettingsNavigation() {
  const pathname = usePathname()
  const [openCategories, setOpenCategories] = useState<string[]>([])

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => (prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]))
  }

  const categories = [
    {
      name: "General",
      icon: Settings,
      items: [
        { name: "Business Information", href: "/dashboard/settings" },
        { name: "Advanced Settings", href: "/dashboard/settings/advanced" },
      ],
    },
    {
      name: "Users & Locations",
      icon: Users,
      items: [
        { name: "User Management", href: "/dashboard/settings/users" },
        { name: "Locations", href: "/dashboard/settings/locations" },
        { name: "Roles & Permissions", href: "/dashboard/settings/roles" },
      ],
    },
    {
      name: "POS Configuration",
      icon: Laptop,
      items: [
        { name: "Terminal Settings", href: "/dashboard/settings/terminal" },
        { name: "Receipt Templates", href: "/dashboard/settings/receipts" },
        { name: "Payment Methods", href: "/dashboard/settings/payment-methods" },
      ],
    },
    {
      name: "Products & Inventory",
      icon: Package,
      items: [
        { name: "Categories", href: "/dashboard/settings/categories" },
        { name: "Inventory Settings", href: "/dashboard/settings/inventory" },
        { name: "Suppliers", href: "/dashboard/settings/suppliers" },
      ],
    },
    {
      name: "Pricing & Discounts",
      icon: Tag,
      items: [
        { name: "Pricing Rules", href: "/dashboard/settings/pricing" },
        { name: "Discounts & Promotions", href: "/dashboard/settings/discounts" },
        { name: "Loyalty Program", href: "/dashboard/settings/loyalty" },
      ],
    },
    {
      name: "Customers",
      icon: Users2,
      items: [
        { name: "Customer Settings", href: "/dashboard/settings/customers" },
        { name: "Customer Groups", href: "/dashboard/settings/customer-groups" },
        { name: "Marketing Settings", href: "/dashboard/settings/marketing" },
      ],
    },
    {
      name: "Industry Specific",
      icon: Store,
      items: [
        { name: "Restaurant Settings", href: "/dashboard/settings/restaurant" },
        { name: "Hotel Settings", href: "/dashboard/settings/hotel" },
        { name: "Retail Settings", href: "/dashboard/settings/retail" },
        { name: "Grocery Settings", href: "/dashboard/settings/grocery" },
      ],
    },
    {
      name: "Taxes & Compliance",
      icon: Receipt,
      items: [
        { name: "Tax Settings", href: "/dashboard/settings/taxes" },
        { name: "Invoicing", href: "/dashboard/settings/invoicing" },
        { name: "Compliance", href: "/dashboard/settings/compliance" },
      ],
    },
    {
      name: "Reports & Analytics",
      icon: BarChart,
      items: [
        { name: "Report Settings", href: "/dashboard/settings/reports" },
        { name: "Scheduled Reports", href: "/dashboard/settings/scheduled-reports" },
        { name: "Analytics", href: "/dashboard/settings/analytics" },
      ],
    },
    {
      name: "Integrations",
      icon: Plug,
      items: [
        { name: "Payment Gateways", href: "/dashboard/settings/payment-gateways" },
        { name: "E-Commerce", href: "/dashboard/settings/ecommerce" },
        { name: "Accounting", href: "/dashboard/settings/accounting" },
        { name: "Delivery Services", href: "/dashboard/settings/delivery" },
        { name: "Vercel", href: "/dashboard/settings/vercel" },
      ],
    },
    {
      name: "Security",
      icon: Shield,
      items: [
        { name: "Security Settings", href: "/dashboard/settings/security" },
        { name: "Backup & Recovery", href: "/dashboard/settings/backup" },
        { name: "Audit Logs", href: "/dashboard/settings/audit" },
      ],
    },
  ]

  return (
    <div className="w-full space-y-1">
      {categories.map((category) => (
        <div key={category.name} className="mb-2">
          <button
            onClick={() => toggleCategory(category.name)}
            className={cn(
              "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              openCategories.includes(category.name) ? "bg-accent/50" : "",
            )}
          >
            <div className="flex items-center">
              <category.icon className="mr-2 h-4 w-4" />
              <span>{category.name}</span>
            </div>
            <ChevronRight
              className={cn("h-4 w-4 transition-transform", openCategories.includes(category.name) ? "rotate-90" : "")}
            />
          </button>

          {openCategories.includes(category.name) && (
            <div className="mt-1 space-y-1 pl-6">
              {category.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
                    pathname === item.href ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground",
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

