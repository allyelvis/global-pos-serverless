"use client"

import { useEffect, useState } from "react"
import { Wifi, WifiOff, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useOfflineMode } from "@/lib/services/offline-mode-service"
import { useI18n } from "@/lib/i18n/i18n-provider"

export function OfflineStatus() {
  const { t } = useI18n()
  const { isOnline, isSyncing, pendingItems, forceSyncAll, clearAllPendingItems, getOfflineStats } = useOfflineMode()
  const [open, setOpen] = useState(false)

  const stats = getOfflineStats()
  const hasPendingItems = stats.pending > 0
  const hasErrors = stats.errors > 0

  // Auto-close popover when all items are synced
  useEffect(() => {
    if (open && isOnline && !hasPendingItems && !hasErrors) {
      const timer = setTimeout(() => setOpen(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [open, isOnline, hasPendingItems, hasErrors])

  return (
    <TooltipProvider>
      <Popover open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 gap-1 px-2 ${
                  !isOnline || hasPendingItems || hasErrors ? "text-amber-500 dark:text-amber-400" : ""
                }`}
              >
                {!isOnline ? (
                  <WifiOff className="h-4 w-4" />
                ) : hasPendingItems || hasErrors ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <Wifi className="h-4 w-4" />
                )}
                <span className="hidden md:inline-flex">
                  {!isOnline ? t("common.offline") : hasPendingItems ? t("common.syncing") : t("common.online")}
                </span>
                {(hasPendingItems || hasErrors) && (
                  <Badge variant="outline" className="ml-1 h-5 w-5 p-0 text-center">
                    {stats.pending + stats.errors}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {!isOnline
              ? t("offline.workingOffline")
              : hasPendingItems
                ? t("offline.pendingSync", { count: String(stats.pending) })
                : hasErrors
                  ? t("offline.syncErrors", { count: String(stats.errors) })
                  : t("offline.allSynced")}
          </TooltipContent>
        </Tooltip>

        <PopoverContent className="w-80 p-4" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">{isOnline ? t("offline.syncStatus") : t("offline.offlineMode")}</h4>
              <Badge variant={isOnline ? "outline" : "destructive"} className="px-2 py-0">
                {isOnline ? t("common.online") : t("common.offline")}
              </Badge>
            </div>

            {stats.total > 0 && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>{t("offline.pendingItems")}</span>
                    <span>
                      {stats.synced}/{stats.total}
                    </span>
                  </div>
                  <Progress value={(stats.synced / stats.total) * 100} />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-md bg-muted p-2">
                    <div className="font-medium">{stats.pending}</div>
                    <div className="text-muted-foreground">{t("offline.pending")}</div>
                  </div>
                  <div className="rounded-md bg-muted p-2">
                    <div className="font-medium">{stats.synced}</div>
                    <div className="text-muted-foreground">{t("offline.synced")}</div>
                  </div>
                  <div className="rounded-md bg-muted p-2">
                    <div className="font-medium">{stats.errors}</div>
                    <div className="text-muted-foreground">{t("offline.errors")}</div>
                  </div>
                </div>
              </>
            )}

            {stats.lastSyncTime && (
              <div className="text-xs text-muted-foreground">
                {t("offline.lastSync")}: {stats.lastSyncTime.toLocaleString()}
              </div>
            )}

            <div className="flex justify-between space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                disabled={!isOnline || isSyncing || stats.pending === 0}
                onClick={forceSyncAll}
              >
                {isSyncing ? (
                  <RefreshCw className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-1 h-4 w-4" />
                )}
                {t("offline.syncNow")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                disabled={stats.total === 0}
                onClick={clearAllPendingItems}
              >
                <CheckCircle2 className="mr-1 h-4 w-4" />
                {t("offline.clearAll")}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  )
}

