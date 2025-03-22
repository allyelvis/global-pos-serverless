type LogLevel = "debug" | "info" | "warn" | "error"

interface LoggerOptions {
  level: LogLevel
  prefix?: string
  enableConsole?: boolean
}

class Logger {
  private level: LogLevel
  private prefix: string
  private enableConsole: boolean
  private logLevels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  }

  constructor(options: LoggerOptions) {
    this.level = options.level
    this.prefix = options.prefix || "GlobalPOS"
    this.enableConsole = options.enableConsole !== false
  }

  private shouldLog(level: LogLevel): boolean {
    return this.logLevels[level] >= this.logLevels[this.level]
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString()
    return `[${timestamp}] [${this.prefix}] [${level.toUpperCase()}] ${message}`
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog("debug") && this.enableConsole) {
      console.debug(this.formatMessage("debug", message), ...args)
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog("info") && this.enableConsole) {
      console.info(this.formatMessage("info", message), ...args)
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog("warn") && this.enableConsole) {
      console.warn(this.formatMessage("warn", message), ...args)
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog("error") && this.enableConsole) {
      console.error(this.formatMessage("error", message), ...args)
    }
  }

  // For server-side logging to a service or file
  async logToService(level: LogLevel, message: string, metadata?: Record<string, any>): Promise<void> {
    // This would be implemented to log to a service like Sentry, Datadog, etc.
    // For now, we'll just console log
    if (this.shouldLog(level) && this.enableConsole) {
      console.log(this.formatMessage(level, message), metadata)
    }
  }
}

// Create and export a default logger instance
export const logger = new Logger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  prefix: "GlobalPOS",
  enableConsole: true,
})

