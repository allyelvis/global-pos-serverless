"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Server,
  Database,
  HardDrive,
  Globe,
  Cpu,
  MemoryStickIcon as Memory,
} from "lucide-react"
import {
  getSystemHealth,
  forceSystemHealthCheck,
  type SystemHealth,
  type ComponentHealth,
} from "@/lib/services/system-health-service"
import { useI18n } from "@/lib/i18n/i18n-provider"
import { formatDistanceToNow, formatDuration } from "@/lib/utils"

export function HealthDashboard() {
  const { t } = useI18n()
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadHealth = async () => {
    setIsLoading(true)
    try {
      const data = await getSystemHealth()
      setHealth(data)
    } catch (error) {
      console.error("Failed to load system health:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshHealth = async () => {
    setIsRefreshing(true)
    try {
      const data = await forceSystemHealthCheck()
      setHealth(data)
    } catch (error) {
      console.error("Failed to refresh system health:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadHealth()
  }, [])

  // Status badge component
  const StatusBadge = ({ status }: { status: ComponentHealth["status"] }) => {
    switch (status) {
      case "healthy":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            {t("health.healthy")}
          </Badge>
        )
      case "degraded":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
            <AlertTriangle className="mr-1 h-3 w-3" />
            {t("health.degraded")}
          </Badge>
        )
      case "unhealthy":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
            <XCircle className="mr-1 h-3 w-3" />
            {t("health.unhealthy")}
          </Badge>
        )
      default:
        return <Badge variant="outline">{t("health.unknown")}</Badge>
    }
  }

  // Component health card
  const ComponentCard = ({
    title,
    component,
    icon: Icon,
  }: {
    title: string
    component: ComponentHealth
    icon: React.ElementType
  }) => (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          <StatusBadge status={component.status} />
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("health.latency")}</span>
            <span className="font-medium">
              {component.latency >= 0 ? `${component.latency}ms` : t("health.unavailable")}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">{component.message}</div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>
            {t("health.lastChecked")}: {formatDistanceToNow(new Date(component.lastChecked))}
          </span>
        </div>
      </CardFooter>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!health) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center space-y-4">
        <XCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg font-medium">{t("health.unavailable")}</p>
        <Button onClick={refreshHealth}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {t("health.retry")}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">{t("health.systemHealth")}</h2>
          <p className="text-muted-foreground">
            {t("health.lastUpdated")}: {formatDistanceToNow(new Date(health.lastChecked))}
          </p>
        </div>
        <Button onClick={refreshHealth} disabled={isRefreshing}>
          {isRefreshing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          {t("health.refresh")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t("health.systemStatus")}</CardTitle>
            <StatusBadge status={health.status} />
          </div>
          <CardDescription>{t("health.systemStatusDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("health.responseTime")}</span>
                <span className="font-medium">{health.metrics.responseTime}ms</span>
              </div>
              <Progress value={Math.min(100, (health.metrics.responseTime / 500) * 100)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("health.uptime")}</span>
                <span className="font-medium">{formatDuration(health.metrics.uptime)}</span>
              </div>
              <Progress value={100} className="bg-green-100 dark:bg-green-900/20" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("health.memoryUsage")}</span>
                <span className="font-medium">{health.metrics.memoryUsage}%</span>
              </div>
              <Progress
                value={health.metrics.memoryUsage}
                className={
                  health.metrics.memoryUsage > 80
                    ? "bg-red-100 dark:bg-red-900/20"
                    : health.metrics.memoryUsage > 60
                      ? "bg-amber-100 dark:bg-amber-900/20"
                      : ""
                }
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("health.cpuUsage")}</span>
                <span className="font-medium">{health.metrics.cpuUsage}%</span>
              </div>
              <Progress
                value={health.metrics.cpuUsage}
                className={
                  health.metrics.cpuUsage > 80
                    ? "bg-red-100 dark:bg-red-900/20"
                    : health.metrics.cpuUsage > 60
                      ? "bg-amber-100 dark:bg-amber-900/20"
                      : ""
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="components">
        <TabsList>
          <TabsTrigger value="components">{t("health.components")}</TabsTrigger>
          <TabsTrigger value="metrics">{t("health.metrics")}</TabsTrigger>
        </TabsList>
        <TabsContent value="components" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <ComponentCard title={t("health.database")} component={health.components.database} icon={Database} />
            <ComponentCard title={t("health.redis")} component={health.components.redis} icon={Server} />
            <ComponentCard title={t("health.api")} component={health.components.api} icon={Globe} />
            <ComponentCard title={t("health.storage")} component={health.components.storage} icon={HardDrive} />
          </div>
        </TabsContent>
        <TabsContent value="metrics" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">{t("health.responseTime")}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{health.metrics.responseTime}ms</div>
                <p className="text-sm text-muted-foreground">
                  {health.metrics.responseTime < 100
                    ? t("health.responseExcellent")
                    : health.metrics.responseTime < 300
                      ? t("health.responseGood")
                      : t("health.responseSlow")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Server className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">{t("health.uptime")}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatDuration(health.metrics.uptime, true)}</div>
                <p className="text-sm text-muted-foreground">{t("health.uptimeDesc")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Memory className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">{t("health.memoryUsage")}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{health.metrics.memoryUsage}%</div>
                <Progress
                  value={health.metrics.memoryUsage}
                  className={`mt-2 ${
                    health.metrics.memoryUsage > 80
                      ? "bg-red-100 dark:bg-red-900/20"
                      : health.metrics.memoryUsage > 60
                        ? "bg-amber-100 dark:bg-amber-900/20"
                        : ""
                  }`}
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  {health.metrics.memoryUsage > 80
                    ? t("health.memoryHigh")
                    : health.metrics.memoryUsage > 60
                      ? t("health.memoryModerate")
                      : t("health.memoryGood")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Cpu className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">{t("health.cpuUsage")}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{health.metrics.cpuUsage}%</div>
                <Progress
                  value={health.metrics.cpuUsage}
                  className={`mt-2 ${
                    health.metrics.cpuUsage > 80
                      ? "bg-red-100 dark:bg-red-900/20"
                      : health.metrics.cpuUsage > 60
                        ? "bg-amber-100 dark:bg-amber-900/20"
                        : ""
                  }`}
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  {health.metrics.cpuUsage > 80
                    ? t("health.cpuHigh")
                    : health.metrics.cpuUsage > 60
                      ? t("health.cpuModerate")
                      : t("health.cpuGood")}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

