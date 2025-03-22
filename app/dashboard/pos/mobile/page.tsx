import type { Metadata } from "next"
import { MobilePOS } from "@/components/pos/mobile-pos"

export const metadata: Metadata = {
  title: "Mobile POS",
  description: "Mobile-optimized Point of Sale interface",
}

export default function MobilePOSPage() {
  return <MobilePOS />
}

