"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  CircleDollarSign,
  ClipboardList,
  Home,
  Package,
  Settings,
  ShoppingCart,
  Users,
  Cloud,
  Store,
  Utensils,
  Hotel,
  Scissors,
  ShoppingBasket,
  Truck,
  CreditCard,
  Gift,
  Bell,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  children?: NavItem[]
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "POS",
    href: "/dashboard/pos",
    icon: ShoppingCart,
  },
  {
    title: "Orders",
    href: "/dashboard/orders",
    icon: ClipboardList,
  },
  {
    title: "Products",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    title: "Customers",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    title: "Transactions",
    href: "/dashboard/transactions",
    icon: CircleDollarSign,
  },
  {
    title: "Industry Solutions",
    href: "/dashboard/sectors",
    icon: Store,
    children: [
      {
        title: "Retail",
        href: "/dashboard/sectors/retail",
        icon: Store,
      },
      {
        title: "Restaurant",
        href: "/dashboard/sectors/restaurant",
        icon: Utensils,
      },
      {
        title: "Hotel",
        href: "/dashboard/sectors/hotel",
        icon: Hotel,
      },
      {
        title: "Salon",
        href: "/dashboard/sectors/salon",
        icon: Scissors,
      },
      {
        title: "Grocery",
        href: "/dashboard/sectors/grocery",
        icon: ShoppingBasket,
      },
    ],
  },
  {
    title: "Inventory",
    href: "/dashboard/inventory",
    icon: Package,
    children: [
      {
        title: "Stock Management",
        href: "/dashboard/inventory/stock",
        icon: Package,
      },
      {
        title: "Suppliers",
        href: "/dashboard/inventory/suppliers",
        icon: Truck,
      },
      {
        title: "Purchase Orders",
        href: "/dashboard/inventory/purchase-orders",
        icon: ClipboardList,
      },
      {
        title: "Stock Transfers",
        href: "/dashboard/inventory/transfers",
        icon: Truck,
      },
    ],
  },
  {
    title: "Marketing",
    href: "/dashboard/marketing",
    icon: Gift,
    children: [
      {
        title: "Promotions",
        href: "/dashboard/marketing/promotions",
        icon: Gift,
      },
      {
        title: "Loyalty Program",
        href: "/dashboard/marketing/loyalty",
        icon: Gift,
      },
      {
        title: "Gift Cards",
        href: "/dashboard/marketing/gift-cards",
        icon: CreditCard,
      },
      {
        title: "Campaigns",
        href: "/dashboard/marketing/campaigns",
        icon: Bell,
      },
    ],
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    title: "Deployment",
    href: "/dashboard/deployment",
    icon: Cloud,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function SideNav() {
  const [isOpen, setIsOpen] = useState(true)
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})
  const pathname = usePathname()

  const toggleCollapsible = (title: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.href)

    if (item.children) {
      return (
        <Collapsible
          key={item.href}
          open={openItems[item.title] || active}
          onOpenChange={() => toggleCollapsible(item.title)}
        >
          <CollapsibleTrigger asChild>
            <button
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                active && "bg-accent text-accent-foreground",
                !isOpen && "justify-center",
              )}
            >
              <item.icon className="h-4 w-4" />
              {isOpen && <span className="flex-1 text-left">{item.title}</span>}
              {isOpen && (
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
                  className={cn("h-4 w-4 transition-transform", openItems[item.title] && "rotate-180")}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 px-2 py-1">
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  isActive(child.href) && "bg-accent text-accent-foreground",
                  !isOpen && "justify-center",
                )}
              >
                <child.icon className="h-4 w-4" />
                {isOpen && <span>{child.title}</span>}
              </Link>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
          active && "bg-accent text-accent-foreground",
          !isOpen && "justify-center",
        )}
      >
        <item.icon className="h-4 w-4" />
        <span className={cn("transition-opacity", isOpen ? "opacity-100" : "opacity-0")}>{item.title}</span>
      </Link>
    )
  }

  return (
    <div
      className={cn(
        "group/sidebar relative flex h-full flex-col border-r bg-background transition-all",
        isOpen ? "w-64" : "w-16",
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        <span className={cn("text-sm font-semibold transition-opacity", isOpen ? "opacity-100" : "opacity-0")}>
          Navigation
        </span>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="h-8 w-8">
          <span className="sr-only">Toggle sidebar</span>
          <div className="flex h-4 w-4 flex-col items-center justify-center space-y-1">
            <span className="h-0.5 w-4 bg-current" />
            <span className="h-0.5 w-4 bg-current" />
            <span className="h-0.5 w-4 bg-current" />
          </div>
        </Button>
      </div>
      <ScrollArea className="flex-1 py-2">
        <nav className="grid gap-1 px-2">{navItems.map(renderNavItem)}</nav>
      </ScrollArea>
    </div>
  )
}

