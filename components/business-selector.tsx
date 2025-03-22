"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const businesses = [
  { value: "retail", label: "Retail Store" },
  { value: "restaurant", label: "Restaurant" },
  { value: "salon", label: "Beauty Salon" },
  { value: "hotel", label: "Hotel" },
  { value: "grocery", label: "Grocery Store" },
]

export function BusinessSelector() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("retail")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-[180px] justify-between">
          {value ? businesses.find((business) => business.value === value)?.label : "Select business..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[180px] p-0">
        <Command>
          <CommandInput placeholder="Search business..." />
          <CommandList>
            <CommandEmpty>No business found.</CommandEmpty>
            <CommandGroup>
              {businesses.map((business) => (
                <CommandItem
                  key={business.value}
                  value={business.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === business.value ? "opacity-100" : "opacity-0")} />
                  {business.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

