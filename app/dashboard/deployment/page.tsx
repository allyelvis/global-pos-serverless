import { DeploymentGuide } from "@/components/deployment-guide"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getVersionInfo } from "@/lib/version"

export default function DeploymentPage() {
  const version = getVersionInfo()

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Deployment</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>Current system version and deployment details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <div className="font-medium">Version:</div>
              <div>{version.build}</div>

              <div className="font-medium">Codename:</div>
              <div>{version.codename}</div>

              <div className="font-medium">Release Date:</div>
              <div>{version.releaseDate}</div>
            </div>
          </CardContent>
        </Card>

        <DeploymentGuide />

        <Card>
          <CardHeader>
            <CardTitle>Deployment History</CardTitle>
            <CardDescription>Recent deployments and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="history">
              <TabsList>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
              </TabsList>

              <TabsContent value="history" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">Initial Deployment</h3>
                        <p className="text-sm text-muted-foreground">Version {version.build}</p>
                      </div>
                      <div className="text-sm text-right">
                        <p>{version.releaseDate}</p>
                        <p className="text-muted-foreground">Admin</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="logs" className="mt-4">
                <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-[300px]">
                  <code>
                    [INFO] {version.releaseDate} - System initialized with version {version.build}
                    <br />
                    [INFO] {version.releaseDate} - Database schema created
                    <br />
                    [INFO] {version.releaseDate} - Default admin user created
                    <br />
                    [INFO] {version.releaseDate} - System ready for use
                  </code>
                </pre>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

