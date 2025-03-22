"use server"

export type BarcodeFormat = "EAN13" | "UPC" | "CODE128" | "QR" | "CODE39"

export interface BarcodeOptions {
  format: BarcodeFormat
  width?: number
  height?: number
  includeText?: boolean
  foregroundColor?: string
  backgroundColor?: string
}

export interface GeneratedBarcode {
  barcodeData: string
  imageUrl: string
  format: BarcodeFormat
}

export class BarcodeService {
  /**
   * Generate a barcode for a product
   */
  static async generateBarcode(
    productId: string,
    productSku: string,
    options: BarcodeOptions = { format: "CODE128" },
  ): Promise<GeneratedBarcode> {
    // In a real implementation, this would use a barcode generation library
    // For now, we'll simulate the generation

    const barcodeData = productSku || `PROD${productId.substring(0, 8)}`

    // In a real implementation, this would be a URL to the generated barcode image
    // For now, we'll return a placeholder
    const imageUrl = `/api/barcode?data=${encodeURIComponent(barcodeData)}&format=${options.format}`

    return {
      barcodeData,
      imageUrl,
      format: options.format,
    }
  }

  /**
   * Validate a barcode
   */
  static validateBarcode(barcodeData: string, format: BarcodeFormat): boolean {
    // In a real implementation, this would validate the barcode format
    // For now, we'll do some basic validation

    switch (format) {
      case "EAN13":
        return /^\d{13}$/.test(barcodeData)
      case "UPC":
        return /^\d{12}$/.test(barcodeData)
      case "CODE128":
        return barcodeData.length > 0
      case "QR":
        return barcodeData.length > 0
      case "CODE39":
        return /^[A-Z0-9\-.\s$/+%]+$/.test(barcodeData)
      default:
        return false
    }
  }

  /**
   * Generate a unique SKU for a product
   */
  static generateSKU(categoryCode: string, productName: string): string {
    const nameCode = productName
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 3)
      .toUpperCase()

    const randomPart = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")

    return `${categoryCode}-${nameCode}${randomPart}`
  }
}

