export default function ArchitecturePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Architecture</h1>
        <p className="text-muted-foreground">Overview of the Global POS System architecture and components.</p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Architecture Diagram</h2>
        <div className="overflow-auto">
          {/* Mermaid diagram will be rendered here */}
          <pre className="mermaid">
            {`
            graph TD
              Client[Client Browser/Device]
              NextJS[Next.js App]
              ServerActions[Server Actions]
              Auth[Authentication]
              DB[(Database)]
              Storage[Storage]
              Payment[Payment Processing]
              
              Client -->|HTTP/HTTPS| NextJS
              NextJS -->|Server Components| Client
              NextJS -->|API Routes| ServerActions
              ServerActions -->|Authentication| Auth
              ServerActions -->|Data Operations| DB
              ServerActions -->|File Operations| Storage
              ServerActions -->|Process Payments| Payment
              
              subgraph "Serverless Architecture"
                NextJS
                ServerActions
                Auth
                DB
                Storage
                Payment
              end
              
              subgraph "Business Sectors"
                Retail[Retail Module]
                Restaurant[Restaurant Module]
                Salon[Salon Module]
                Hotel[Hotel Module]
              end
              
              NextJS --> Retail
              NextJS --> Restaurant
              NextJS --> Salon
              NextJS --> Hotel
            `}
          </pre>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Key Components</h2>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <div>
                <span className="font-medium">Next.js App:</span> The core application built with Next.js App Router,
                providing server and client components.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <div>
                <span className="font-medium">Server Actions:</span> Serverless functions that handle data operations,
                authentication, and business logic.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <div>
                <span className="font-medium">Authentication:</span> Handles user authentication, authorization, and
                session management.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <div>
                <span className="font-medium">Database:</span> Stores business data, product information, orders, and
                customer details.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <div>
                <span className="font-medium">Storage:</span> Handles file storage for product images, receipts, and
                other documents.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <div>
                <span className="font-medium">Payment Processing:</span> Integrates with payment gateways to process
                transactions.
              </div>
            </li>
          </ul>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Serverless Benefits</h2>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
              <div>
                <span className="font-medium">Automatic Scaling:</span> The system scales automatically based on demand,
                handling peak loads without manual intervention.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
              <div>
                <span className="font-medium">Global Distribution:</span> Deployed globally to provide low-latency
                access from anywhere in the world.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
              <div>
                <span className="font-medium">Cost Efficiency:</span> Pay only for what you use, with no need to
                provision or manage servers.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
              <div>
                <span className="font-medium">High Availability:</span> Built-in redundancy and fault tolerance ensure
                the system remains available.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
              <div>
                <span className="font-medium">Security:</span> Automatic security updates and isolated execution
                environments enhance security.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
              <div>
                <span className="font-medium">Rapid Development:</span> Focus on building features rather than managing
                infrastructure.
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

