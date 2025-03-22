"use server"

import { revalidatePath } from "next/cache"
import redis from "../db/redis"
import { generateId } from "../utils"
import { logger } from "../logger"

export interface EmployeePerformance {
  id: string
  employeeId: string
  businessId: string
  date: string
  metrics: {
    salesCount: number
    salesTotal: number
    averageOrderValue: number
    itemsPerTransaction: number
    refundsCount: number
    refundsTotal: number
    discountsTotal: number
    customersServed: number
    newCustomersCount: number
    transactionSpeed: number // in seconds
    voidCount: number
  }
  goals?: {
    salesTotal?: number
    averageOrderValue?: number
    customersServed?: number
    newCustomersCount?: number
  }
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface EmployeeShift {
  id: string
  employeeId: string
  businessId: string
  locationId: string
  startTime: string
  endTime?: string
  status: "scheduled" | "in_progress" | "completed" | "missed"
  cashDrawerOpeningAmount?: number
  cashDrawerClosingAmount?: number
  cashVariance?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

const EMPLOYEE_PERFORMANCE_KEY = "employee_performance"
const EMPLOYEE_SHIFTS_KEY = "employee_shifts"

export class EmployeePerformanceService {
  /**
   * Record employee performance
   */
  static async recordPerformance(
    performanceData: Omit<EmployeePerformance, "id" | "createdAt" | "updatedAt">,
  ): Promise<EmployeePerformance> {
    try {
      const id = generateId()
      const performance: EmployeePerformance = {
        id,
        ...performanceData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await redis.hset(
        `${EMPLOYEE_PERFORMANCE_KEY}:${performanceData.businessId}:${performanceData.employeeId}`,
        performanceData.date,
        JSON.stringify(performance),
      )

      revalidatePath(`/dashboard/employees/${performanceData.employeeId}`)

      return performance
    } catch (error) {
      logger.error("Failed to record employee performance:", error)
      throw error
    }
  }

  /**
   * Get employee performance for a date
   */
  static async getEmployeePerformanceForDate(
    businessId: string,
    employeeId: string,
    date: string,
  ): Promise<EmployeePerformance | null> {
    try {
      const performanceData = await redis.hget(`${EMPLOYEE_PERFORMANCE_KEY}:${businessId}:${employeeId}`, date)

      return performanceData ? (JSON.parse(performanceData) as EmployeePerformance) : null
    } catch (error) {
      logger.error(`Failed to get performance for employee ${employeeId} on ${date}:`, error)
      return null
    }
  }

  /**
   * Get employee performance for a date range
   */
  static async getEmployeePerformanceForDateRange(
    businessId: string,
    employeeId: string,
    startDate: string,
    endDate: string,
  ): Promise<EmployeePerformance[]> {
    try {
      const performanceData = await redis.hgetall(`${EMPLOYEE_PERFORMANCE_KEY}:${businessId}:${employeeId}`)

      if (!performanceData) {
        return []
      }

      return Object.values(performanceData)
        .map((data) => JSON.parse(data as string) as EmployeePerformance)
        .filter((performance) => performance.date >= startDate && performance.date <= endDate)
        .sort((a, b) => a.date.localeCompare(b.date))
    } catch (error) {
      logger.error(`Failed to get performance for employee ${employeeId} from ${startDate} to ${endDate}:`, error)
      return []
    }
  }

  /**
   * Get performance for all employees on a date
   */
  static async getAllEmployeesPerformanceForDate(businessId: string, date: string): Promise<EmployeePerformance[]> {
    try {
      // Get all employee IDs
      const employeeIds = await this.getEmployeeIds(businessId)

      // Get performance for each employee
      const performances: EmployeePerformance[] = []

      for (const employeeId of employeeIds) {
        const performance = await this.getEmployeePerformanceForDate(businessId, employeeId, date)

        if (performance) {
          performances.push(performance)
        }
      }

      return performances
    } catch (error) {
      logger.error(`Failed to get all employees performance for ${date}:`, error)
      return []
    }
  }

  /**
   * Get employee IDs
   */
  private static async getEmployeeIds(businessId: string): Promise<string[]> {
    try {
      // In a real implementation, this would get employee IDs from the database
      // For now, we'll return a hardcoded list
      return ["employee1", "employee2", "employee3"]
    } catch (error) {
      logger.error(`Failed to get employee IDs for business ${businessId}:`, error)
      return []
    }
  }

  /**
   * Start employee shift
   */
  static async startShift(
    shiftData: Omit<EmployeeShift, "id" | "endTime" | "status" | "createdAt" | "updatedAt">,
  ): Promise<EmployeeShift> {
    try {
      const id = generateId()
      const shift: EmployeeShift = {
        id,
        ...shiftData,
        status: "in_progress",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await redis.hset(
        `${EMPLOYEE_SHIFTS_KEY}:${shiftData.businessId}:${shiftData.employeeId}`,
        id,
        JSON.stringify(shift),
      )

      revalidatePath(`/dashboard/employees/${shiftData.employeeId}`)

      return shift
    } catch (error) {
      logger.error("Failed to start employee shift:", error)
      throw error
    }
  }

  /**
   * End employee shift
   */
  static async endShift(
    shiftId: string,
    businessId: string,
    employeeId: string,
    endTime: string,
    cashDrawerClosingAmount?: number,
    notes?: string,
  ): Promise<EmployeeShift | null> {
    try {
      const shiftData = await redis.hget(`${EMPLOYEE_SHIFTS_KEY}:${businessId}:${employeeId}`, shiftId)

      if (!shiftData) {
        return null
      }

      const shift = JSON.parse(shiftData) as EmployeeShift

      if (shift.status !== "in_progress") {
        throw new Error("Shift is not in progress")
      }

      const updatedShift: EmployeeShift = {
        ...shift,
        endTime,
        status: "completed",
        cashDrawerClosingAmount,
        cashVariance:
          cashDrawerClosingAmount !== undefined && shift.cashDrawerOpeningAmount !== undefined
            ? cashDrawerClosingAmount - shift.cashDrawerOpeningAmount
            : undefined,
        notes: notes || shift.notes,
        updatedAt: new Date().toISOString(),
      }

      await redis.hset(`${EMPLOYEE_SHIFTS_KEY}:${businessId}:${employeeId}`, shiftId, JSON.stringify(updatedShift))

      revalidatePath(`/dashboard/employees/${employeeId}`)

      return updatedShift
    } catch (error) {
      logger.error(`Failed to end shift ${shiftId}:`, error)
      return null
    }
  }

  /**
   * Get employee shifts for a date range
   */
  static async getEmployeeShiftsForDateRange(
    businessId: string,
    employeeId: string,
    startDate: string,
    endDate: string,
  ): Promise<EmployeeShift[]> {
    try {
      const shiftsData = await redis.hgetall(`${EMPLOYEE_SHIFTS_KEY}:${businessId}:${employeeId}`)

      if (!shiftsData) {
        return []
      }

      return Object.values(shiftsData)
        .map((data) => JSON.parse(data as string) as EmployeeShift)
        .filter((shift) => {
          const shiftDate = shift.startTime.split("T")[0]
          return shiftDate >= startDate && shiftDate <= endDate
        })
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
    } catch (error) {
      logger.error(`Failed to get shifts for employee ${employeeId} from ${startDate} to ${endDate}:`, error)
      return []
    }
  }

  /**
   * Get active shifts
   */
  static async getActiveShifts(businessId: string, locationId?: string): Promise<EmployeeShift[]> {
    try {
      // Get all employee IDs
      const employeeIds = await this.getEmployeeIds(businessId)

      // Get active shifts for each employee
      const activeShifts: EmployeeShift[] = []

      for (const employeeId of employeeIds) {
        const shiftsData = await redis.hgetall(`${EMPLOYEE_SHIFTS_KEY}:${businessId}:${employeeId}`)

        if (shiftsData) {
          const shifts = Object.values(shiftsData)
            .map((data) => JSON.parse(data as string) as EmployeeShift)
            .filter((shift) => shift.status === "in_progress" && (!locationId || shift.locationId === locationId))

          activeShifts.push(...shifts)
        }
      }

      return activeShifts
    } catch (error) {
      logger.error(`Failed to get active shifts for business ${businessId}:`, error)
      return []
    }
  }
}

