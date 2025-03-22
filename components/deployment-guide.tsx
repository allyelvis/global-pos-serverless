import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, Server } from "lucide-react"
import { getVersionInfo } from "@/lib/version"

export function DeploymentGuide() {
  const version = getVersionInfo()

  return (
    <div className="space-y-6">
      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Deployment Ready</AlertTitle>
        <AlertDescription>Your Global POS system v{version.build} is ready for deployment.</AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Deployment Guide
          </CardTitle>
          <CardDescription>Follow these steps to deploy your Global POS system</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="vercel">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="vercel">Vercel</TabsTrigger>
              <TabsTrigger value="docker">Docker</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>

            <TabsContent value="vercel" className="space-y-4 mt-4">
              <h3 className="text-lg font-medium">Deploy to Vercel</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Push your code to a Git repository (GitHub, GitLab, or Bitbucket)</li>
                <li>Log in to your Vercel account</li>
                <li>Click "Add New" and select "Project"</li>
                <li>Import your Git repository</li>
                <li>
                  Configure the following environment variables:
                  <ul className="list-disc pl-5 mt-2">
                    <li>
                      <code>REDIS_URL</code> - Your Redis connection string
                    </li>
                    <li>
                      <code>REDIS_TOKEN</code> - Your Redis authentication token
                    </li>
                    <li>
                      <code>NEXTAUTH_SECRET</code> - A random string for JWT encryption
                    </li>
                    <li>
                      <code>NEXT_PUBLIC_APP_VERSION</code> - Set to {version.build}
                    </li>
                  </ul>
                </li>
                <li>Click "Deploy"</li>
              </ol>
            </TabsContent>

            <TabsContent value="docker" className="space-y-4 mt-4">
              <h3 className="text-lg font-medium">Deploy with Docker</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  Build the Docker image:
                  <pre className="bg-muted p-2 rounded-md mt-1 overflow-x-auto">
                    <code>docker build -t global-pos:{version.build} .</code>
                  </pre>
                </li>
                <li>
                  Run the container:
                  <pre className="bg-muted p-2 rounded-md mt-1 overflow-x-auto">
                    <code>
                      docker run -p 3000:3000 -e REDIS_URL=your_redis_url -e REDIS_TOKEN=your_redis_token global-pos:
                      {version.build}
                    </code>
                  </pre>
                </li>
              </ol>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4 mt-4">
              <h3 className="text-lg font-medium">Custom Deployment</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  Build the application:
                  <pre className="bg-muted p-2 rounded-md mt-1 overflow-x-auto">
                    <code>npm run build</code>
                  </pre>
                </li>
                <li>
                  Set up environment variables:
                  <pre className="bg-muted p-2 rounded-md mt-1 overflow-x-auto">
                    <code>
                      REDIS_URL=your_redis_url
                      <br />
                      REDIS_TOKEN=your_redis_token
                      <br />
                      NEXTAUTH_SECRET=your_secret
                      <br />
                      NEXT_PUBLIC_APP_VERSION={version.build}
                    </code>
                  </pre>
                </li>
                <li>
                  Start the production server:
                  <pre className="bg-muted p-2 rounded-md mt-1 overflow-x-auto">
                    <code>npm start</code>
                  </pre>
                </li>
              </ol>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

