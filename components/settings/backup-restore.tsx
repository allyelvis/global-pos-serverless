"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Save, Trash2, RefreshCw, AlertTriangle, Calendar, Database, HardDrive } from "lucide-react"
import {
  createBackup,
  getBackups,
  restoreBackup,
  deleteBackup,
  type BackupMetadata,
} from "@/lib/services/backup-service"
import { useI18n } from "@/lib/i18n/i18n-provider"
import { formatBytes, formatDistanceToNow } from "@/lib/utils"

export function BackupRestore() {
  const { t } = useI18n()
  const { toast } = useToast()
  const [backups, setBackups] = useState<BackupMetadata[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [backupDescription, setBackupDescription] = useState("")
  const [selectedBackupId, setSelectedBackupId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("backups")

  // Load backups
  const loadBackups = async () => {
    setIsLoading(true)
    try {
      const data = await getBackups()
      setBackups(data)
    } catch (error) {
      console.error("Failed to load backups:", error)
      toast({
        title: t("backups.loadError"),
        description: t("backups.loadErrorDesc"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadBackups()
  }, [])

  // Create a new backup
  const handleCreateBackup = async () => {
    setIsCreating(true)
    try {
      const result = await createBackup(backupDescription)
      if (result) {
        toast({
          title: t("backups.createSuccess"),
          description: t("backups.createSuccessDesc"),
        })
        setBackupDescription("")
        await loadBackups()
      } else {
        throw new Error("Failed to create backup")
      }
    } catch (error) {
      console.error("Failed to create backup:", error)
      toast({
        title: t("backups.createError"),
        description: t("backups.createErrorDesc"),
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  // Restore from a backup
  const handleRestoreBackup = async () => {
    if (!selectedBackupId) return

    setIsRestoring(true)
    try {
      const result = await restoreBackup(selectedBackupId)
      if (result) {
        toast({
          title: t("backups.restoreSuccess"),
          description: t("backups.restoreSuccessDesc"),
        })
        setSelectedBackupId(null)
      } else {
        throw new Error("Failed to restore backup")
      }
    } catch (error) {
      console.error("Failed to restore backup:", error)
      toast({
        title: t("backups.restoreError"),
        description: t("backups.restoreErrorDesc"),
        variant: "destructive",
      })
    } finally {
      setIsRestoring(false)
    }
  }

  // Delete a backup
  const handleDeleteBackup = async (id: string) => {
    try {
      const result = await deleteBackup(id)
      if (result) {
        toast({
          title: t("backups.deleteSuccess"),
          description: t("backups.deleteSuccessDesc"),
        })
        await loadBackups()
      } else {
        throw new Error("Failed to delete backup")
      }
    } catch (error) {
      console.error("Failed to delete backup:", error)
      toast({
        title: t("backups.deleteError"),
        description: t("backups.deleteErrorDesc"),
        variant: "destructive",
      })
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="backups">{t("backups.manageBackups")}</TabsTrigger>
        <TabsTrigger value="create">{t("backups.createBackup")}</TabsTrigger>
      </TabsList>

      <TabsContent value="backups" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("backups.availableBackups")}</CardTitle>
            <CardDescription>{t("backups.availableBackupsDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : backups.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center space-y-2 text-center">
                <Database className="h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground">{t("backups.noBackups")}</p>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("create")}>
                  {t("backups.createFirst")}
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("backups.description")}</TableHead>
                      <TableHead>{t("backups.date")}</TableHead>
                      <TableHead>{t("backups.size")}</TableHead>
                      <TableHead className="text-right">{t("backups.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backups.map((backup) => (
                      <TableRow key={backup.id}>
                        <TableCell className="font-medium">{backup.description}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{new Date(backup.createdAt).toLocaleDateString()}</span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({formatDistanceToNow(new Date(backup.createdAt))})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <HardDrive className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{formatBytes(backup.size)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  {t("backups.restore")}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t("backups.confirmRestore")}</AlertDialogTitle>
                                  <AlertDialogDescription>{t("backups.confirmRestoreDesc")}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => {
                                      setSelectedBackupId(backup.id)
                                      handleRestoreBackup()
                                    }}
                                    disabled={isRestoring}
                                  >
                                    {isRestoring ? (
                                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                      <RefreshCw className="mr-2 h-4 w-4" />
                                    )}
                                    {t("backups.restore")}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {t("backups.delete")}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t("backups.confirmDelete")}</AlertDialogTitle>
                                  <AlertDialogDescription>{t("backups.confirmDeleteDesc")}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteBackup(backup.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {t("backups.delete")}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={loadBackups} disabled={isLoading}>
              {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              {t("backups.refresh")}
            </Button>
            <Button onClick={() => setActiveTab("create")}>
              <Save className="mr-2 h-4 w-4" />
              {t("backups.createNew")}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="create">
        <Card>
          <CardHeader>
            <CardTitle>{t("backups.createBackup")}</CardTitle>
            <CardDescription>{t("backups.createBackupDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="backup-description">{t("backups.description")}</Label>
              <Input
                id="backup-description"
                placeholder={t("backups.descriptionPlaceholder")}
                value={backupDescription}
                onChange={(e) => setBackupDescription(e.target.value)}
              />
            </div>

            <div className="rounded-md border p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h4 className="text-sm font-medium">{t("backups.important")}</h4>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{t("backups.importantDesc")}</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setActiveTab("backups")}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleCreateBackup} disabled={isCreating}>
              {isCreating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {t("backups.createBackup")}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

