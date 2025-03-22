import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SalesForecast } from "@/components/ai/sales-forecast"
import { ProductRecommendations } from "@/components/ai/product-recommendations"
import { DynamicPricing } from "@/components/ai/dynamic-pricing"
import { FraudDetection } from "@/components/ai/fraud-detection"
import { CustomerInsights } from "@/components/ai/customer-insights"
import { InventoryOptimization } from "@/components/ai/inventory-optimization"
import { Brain, Sparkles } from "lucide-react"

export default function AIDashboardPage() {
  // Sample data - in a real app, this would come from your database
  const businessId = "business-1"
  const sampleProductId = "product-1"
  const sampleCustomerId = "customer-1"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI-Powered Features</h2>
          <p className="text-muted-foreground">Advanced AI capabilities to optimize your business operations</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
          <Sparkles className="h-4 w-4" />
          <span>AI-Powered</span>
        </div>
      </div>

      <Tabs defaultValue="forecasting" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="forecasting">Sales Forecasting</TabsTrigger>
          <TabsTrigger value="recommendations">Product Recommendations</TabsTrigger>
          <TabsTrigger value="pricing">Dynamic Pricing</TabsTrigger>
          <TabsTrigger value="fraud">Fraud Detection</TabsTrigger>
          <TabsTrigger value="customers">Customer Insights</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="forecasting" className="space-y-4">
          <Card className="border-none">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center text-lg">
                <Brain className="mr-2 h-5 w-5 text-primary" />
                AI Sales Forecasting
              </CardTitle>
              <CardDescription>Predict future sales trends to optimize inventory and staffing</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <SalesForecast businessId={businessId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card className="border-none">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center text-lg">
                <Brain className="mr-2 h-5 w-5 text-primary" />
                AI Product Recommendations
              </CardTitle>
              <CardDescription>
                Intelligent cross-selling and upselling suggestions based on customer behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <ProductRecommendations productId={sampleProductId} customerId={sampleCustomerId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card className="border-none">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center text-lg">
                <Brain className="mr-2 h-5 w-5 text-primary" />
                AI Dynamic Pricing
              </CardTitle>
              <CardDescription>
                Automatically adjust prices based on demand, inventory, and market conditions
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="grid gap-4 md:grid-cols-2">
                <DynamicPricing productId={sampleProductId} basePrice={29.99} inventory={15} demand={8} />
                <DynamicPricing productId="product-2" basePrice={49.99} inventory={5} demand={20} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fraud" className="space-y-4">
          <Card className="border-none">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center text-lg">
                <Brain className="mr-2 h-5 w-5 text-primary" />
                AI Fraud Detection
              </CardTitle>
              <CardDescription>Identify suspicious transactions and prevent fraud in real-time</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <FraudDetection />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card className="border-none">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center text-lg">
                <Brain className="mr-2 h-5 w-5 text-primary" />
                AI Customer Insights
              </CardTitle>
              <CardDescription>Understand customer behavior and preferences to personalize experiences</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="grid gap-4 md:grid-cols-2">
                <CustomerInsights customerId={sampleCustomerId} />
                <CustomerInsights customerId="customer-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card className="border-none">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center text-lg">
                <Brain className="mr-2 h-5 w-5 text-primary" />
                AI Inventory Optimization
              </CardTitle>
              <CardDescription>
                Smart inventory management to prevent stockouts and reduce carrying costs
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="grid gap-4 md:grid-cols-2">
                <InventoryOptimization businessId={businessId} productId={sampleProductId} currentStock={12} />
                <InventoryOptimization businessId={businessId} productId="product-2" currentStock={3} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

