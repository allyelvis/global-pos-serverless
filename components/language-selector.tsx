"use client"

import { useState } from "react"
import { Check, ChevronDown, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useI18n, type AVAILABLE_LANGUAGES } from "@/lib/i18n/i18n-provider"

export function LanguageSelector() {
  const { language, setLanguage, availableLanguages } = useI18n()
  const [open, setOpen] = useState(false)

  const handleSelectLanguage = (lang: string) => {
    setLanguage(lang)
    setOpen(false)
  }

  const currentLanguage = availableLanguages[language as keyof typeof AVAILABLE_LANGUAGES]

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
          <Globe className="h-4 w-4" />
          <span className="hidden md:inline-flex">
            {currentLanguage.flag} {currentLanguage.name}
          </span>
          <span className="inline-flex md:hidden">{currentLanguage.flag}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(availableLanguages).map(([code, { name, flag }]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleSelectLanguage(code)}
            className="flex cursor-pointer items-center justify-between"
          >
            <span>
              {flag} {name}
            </span>
            {language === code && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

