import type { Metadata } from "next"
import { SyncStatus } from "@/components/system/sync-status"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "System Status",
  description: "Monitor and manage system status and synchronization",
}

export default function SystemStatusPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">System Status</h1>
        <p className="text-muted-foreground">Monitor and manage system status, synchronization, and health</p>
      </div>

      <Tabs defaultValue="sync">
        <TabsList className="mb-4">
          <TabsTrigger value="sync">Synchronization</TabsTrigger>
          <TabsTrigger value="health">System Health</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="sync">
          <div className="grid gap-6 md:grid-cols-2">
            <SyncStatus />

            <Card>
              <CardHeader>
                <CardTitle>Offline Mode Settings</CardTitle>
                <CardDescription>Configure how the system behaves when offline</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Offline mode settings will be displayed here</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Monitor the health of system components</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">System health information will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>View system logs and events</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">System logs will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

