import { type NextRequest, NextResponse } from "next/server"
import type { BarcodeFormat } from "@/lib/services/barcode-service"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const data = searchParams.get("data")
  const format = (searchParams.get("format") as BarcodeFormat) || "CODE128"

  if (!data) {
    return NextResponse.json({ error: "Missing data parameter" }, { status: 400 })
  }

  // In a real implementation, this would generate a barcode image
  // For now, we'll return a placeholder SVG

  const width = 200
  const height = 80

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white"/>
      <text x="50%" y="20" font-family="Arial" font-size="12" text-anchor="middle">${format}</text>
      <g>
        ${generateBarcodeSVG(data, width, height)}
      </g>
      <text x="50%" y="${height - 10}" font-family="Arial" font-size="12" text-anchor="middle">${data}</text>
    </svg>
  `

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}

function generateBarcodeSVG(data: string, width: number, height: number): string {
  // This is a simplified barcode representation
  // In a real implementation, this would generate actual barcode patterns

  const barWidth = Math.max(1, Math.floor((width - 40) / data.length / 2))
  const startX = 20
  let currentX = startX
  let result = ""

  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i)
    const barHeight = height - 40

    // Generate a bar with height based on the character code
    result += `<rect x="${currentX}" y="25" width="${barWidth}" height="${barHeight}" fill="black"/>`

    currentX += barWidth * 2
  }

  return result
}

