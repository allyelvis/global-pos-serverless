import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download } from "lucide-react"
import type { Invoice } from "@/lib/types"

interface InvoicesListProps {
  invoices: Invoice[]
}

export function InvoicesList({ invoices }: InvoicesListProps) {
  if (invoices.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No invoices found.</div>
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>
      case "open":
        return <Badge className="bg-blue-500">Open</Badge>
      case "draft":
        return <Badge className="bg-gray-500">Draft</Badge>
      case "uncollectible":
        return <Badge className="bg-yellow-500">Uncollectible</Badge>
      case "void":
        return <Badge className="bg-red-500">Void</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice Number</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">INV-{invoice.id.substring(0, 8).toUpperCase()}</TableCell>
            <TableCell>{formatDate(invoice.createdAt)}</TableCell>
            <TableCell>{formatCurrency(invoice.amount, invoice.currency)}</TableCell>
            <TableCell>{getStatusBadge(invoice.status)}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" disabled={invoice.status !== "paid"}>
                <Download className="h-4 w-4" />
                <span className="sr-only">Download</span>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

