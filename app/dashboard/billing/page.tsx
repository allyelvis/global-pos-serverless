import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCurrentUser } from "@/lib/db/users"
import { getBusinessById } from "@/lib/db/business"
import { getSubscriptionByBusinessId, getSubscriptionPlanById, getInvoicesByBusinessId } from "@/lib/db/subscriptions"
import { createPortalSession } from "@/lib/payment/stripe"
import { BillingInfo } from "@/components/billing/billing-info"
import { InvoicesList } from "@/components/billing/invoices-list"
import { UsageStats } from "@/components/billing/usage-stats"

export default async function BillingPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const business = await getBusinessById(user.businessId)
  if (!business) {
    redirect("/setup")
  }

  const subscription = business.subscriptionId ? await getSubscriptionByBusinessId(business.businessId) : null

  const plan = subscription?.planId ? await getSubscriptionPlanById(subscription.planId) : null

  const invoices = await getInvoicesByBusinessId(business.id)

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <form
          action={async () => {
            "use server"
            const { url } = await createPortalSession()
            redirect(url)
          }}
        >
          <Button type="submit">Manage Subscription</Button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <BillingInfo business={business} subscription={subscription} plan={plan} />

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Usage Statistics</CardTitle>
            <CardDescription>Your current usage compared to your plan limits</CardDescription>
          </CardHeader>
          <CardContent>
            <UsageStats plan={plan} />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices" className="w-full">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
        </TabsList>
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>View and download your past invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <InvoicesList invoices={invoices} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="payment-methods">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your payment methods</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Payment methods can be managed in the Stripe Customer Portal.</p>
              <form
                action={async () => {
                  "use server"
                  const { url } = await createPortalSession()
                  redirect(url)
                }}
                className="mt-4"
              >
                <Button type="submit">Manage Payment Methods</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

