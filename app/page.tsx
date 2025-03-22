import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Globe, ShieldCheck, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <span className="text-sm font-bold text-primary-foreground">POS</span>
            </div>
            <span className="text-lg font-bold">Global POS</span>
          </div>
          <nav className="hidden gap-6 md:flex">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </Link>
            <Link
              href="#testimonials"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Testimonials
            </Link>
            <Link
              href="#faq"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container flex flex-1 flex-col items-center justify-center gap-6 py-12 text-center md:py-20">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            The Ultimate <span className="text-primary">Global POS</span> Solution
          </h1>
          <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
            A powerful, serverless point-of-sale system designed for businesses of all sizes across various sectors.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/register">
            <Button size="lg" className="gap-2">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/setup">
            <Button size="lg" variant="outline">
              Quick Setup
            </Button>
          </Link>
        </div>
        <div className="mt-8 w-full max-w-5xl overflow-hidden rounded-lg border bg-muted/50 shadow-xl">
          <div className="aspect-[16/9] bg-muted">
            <div className="flex h-full items-center justify-center">
              <div className="text-2xl font-semibold text-muted-foreground">POS Dashboard Preview</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-12 md:py-20">
        <div className="mx-auto mb-12 max-w-[800px] text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Powerful Features for Every Business
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Our global POS system comes packed with features to help you manage your business efficiently.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1 */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Multi-Sector Support</h3>
            <p className="text-muted-foreground">
              Specialized features for retail, restaurant, salon, hotel, and more sectors in one unified platform.
            </p>
          </div>
          {/* Feature 2 */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Global Currency Support</h3>
            <p className="text-muted-foreground">
              Handle transactions in multiple currencies with real-time exchange rates and automatic conversions.
            </p>
          </div>
          {/* Feature 3 */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Secure & Reliable</h3>
            <p className="text-muted-foreground">
              Enterprise-grade security with offline capabilities to ensure your business never stops.
            </p>
          </div>
          {/* Feature 4 */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Comprehensive Inventory</h3>
            <p className="text-muted-foreground">
              Track products, manage stock levels, and get alerts for low inventory across multiple locations.
            </p>
          </div>
          {/* Feature 5 */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Advanced Reporting</h3>
            <p className="text-muted-foreground">
              Get insights with detailed reports on sales, inventory, customer behavior, and employee performance.
            </p>
          </div>
          {/* Feature 6 */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Customer Management</h3>
            <p className="text-muted-foreground">
              Build relationships with integrated CRM features, loyalty programs, and personalized marketing.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted py-12 md:py-20">
        <div className="container text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Ready to Transform Your Business?
          </h2>
          <p className="mx-auto mt-4 max-w-[600px] text-lg text-muted-foreground">
            Join thousands of businesses worldwide that trust our Global POS system.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <span className="text-sm font-bold text-primary-foreground">POS</span>
            </div>
            <span className="text-lg font-bold">Global POS</span>
          </div>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Global POS. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

