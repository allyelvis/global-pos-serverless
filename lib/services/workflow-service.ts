"use server"

import { revalidatePath } from "next/cache"
import redis from "../db/redis"
import { generateId } from "../utils"
import { logger } from "../logger"

export type WorkflowTrigger =
  | "order_created"
  | "order_completed"
  | "order_cancelled"
  | "low_stock"
  | "customer_created"
  | "product_created"
  | "scheduled"

export type WorkflowAction =
  | "send_email"
  | "send_sms"
  | "generate_report"
  | "create_purchase_order"
  | "update_inventory"
  | "notify_staff"

export interface Workflow {
  id: string
  name: string
  description?: string
  trigger: WorkflowTrigger
  triggerConditions?: Record<string, any>
  actions: WorkflowActionConfig[]
  isActive: boolean
  businessId: string
  createdBy: string
  createdAt: string
  updatedAt: string
  lastRunAt?: string
  scheduleConfig?: {
    frequency: "daily" | "weekly" | "monthly"
    time: string
    dayOfWeek?: number // 0-6, Sunday to Saturday
    dayOfMonth?: number // 1-31
  }
}

export interface WorkflowActionConfig {
  type: WorkflowAction
  config: Record<string, any>
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  trigger: WorkflowTrigger
  triggerData: Record<string, any>
  status: "pending" | "running" | "completed" | "failed"
  startedAt: string
  completedAt?: string
  results: WorkflowActionResult[]
}

export interface WorkflowActionResult {
  type: WorkflowAction
  status: "success" | "failed"
  message?: string
  data?: Record<string, any>
}

const WORKFLOWS_KEY = "workflows"
const WORKFLOW_EXECUTIONS_KEY = "workflow_executions"

export class WorkflowService {
  /**
   * Create a new workflow
   */
  static async createWorkflow(workflowData: Omit<Workflow, "id" | "createdAt" | "updatedAt">): Promise<Workflow> {
    try {
      const id = generateId()
      const workflow: Workflow = {
        id,
        ...workflowData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await redis.hset(WORKFLOWS_KEY, id, JSON.stringify(workflow))

      revalidatePath("/dashboard/workflows")

      return workflow
    } catch (error) {
      logger.error("Failed to create workflow:", error)
      throw error
    }
  }

  /**
   * Get a workflow by ID
   */
  static async getWorkflowById(id: string): Promise<Workflow | null> {
    try {
      const workflowData = await redis.hget(WORKFLOWS_KEY, id)
      return workflowData ? (JSON.parse(workflowData) as Workflow) : null
    } catch (error) {
      logger.error(`Failed to get workflow ${id}:`, error)
      return null
    }
  }

  /**
   * Get all workflows for a business
   */
  static async getWorkflowsByBusinessId(businessId: string): Promise<Workflow[]> {
    try {
      const workflowsData = await redis.hgetall(WORKFLOWS_KEY)

      if (!workflowsData) {
        return []
      }

      return Object.values(workflowsData)
        .map((data) => JSON.parse(data as string) as Workflow)
        .filter((workflow) => workflow.businessId === businessId)
    } catch (error) {
      logger.error(`Failed to get workflows for business ${businessId}:`, error)
      return []
    }
  }

  /**
   * Update a workflow
   */
  static async updateWorkflow(id: string, workflowData: Partial<Workflow>): Promise<Workflow | null> {
    try {
      const existingWorkflow = await this.getWorkflowById(id)

      if (!existingWorkflow) {
        return null
      }

      const updatedWorkflow: Workflow = {
        ...existingWorkflow,
        ...workflowData,
        updatedAt: new Date().toISOString(),
      }

      await redis.hset(WORKFLOWS_KEY, id, JSON.stringify(updatedWorkflow))

      revalidatePath("/dashboard/workflows")

      return updatedWorkflow
    } catch (error) {
      logger.error(`Failed to update workflow ${id}:`, error)
      return null
    }
  }

  /**
   * Delete a workflow
   */
  static async deleteWorkflow(id: string): Promise<boolean> {
    try {
      await redis.hdel(WORKFLOWS_KEY, id)

      revalidatePath("/dashboard/workflows")

      return true
    } catch (error) {
      logger.error(`Failed to delete workflow ${id}:`, error)
      return false
    }
  }

  /**
   * Trigger a workflow
   */
  static async triggerWorkflow(
    trigger: WorkflowTrigger,
    triggerData: Record<string, any>,
    businessId: string,
  ): Promise<WorkflowExecution[]> {
    try {
      // Find workflows that match the trigger
      const workflows = await this.getWorkflowsByBusinessId(businessId)
      const matchingWorkflows = workflows.filter((workflow) => workflow.isActive && workflow.trigger === trigger)

      if (matchingWorkflows.length === 0) {
        return []
      }

      const executions: WorkflowExecution[] = []

      // Execute each matching workflow
      for (const workflow of matchingWorkflows) {
        // Check if trigger conditions are met
        if (workflow.triggerConditions && !this.evaluateTriggerConditions(workflow.triggerConditions, triggerData)) {
          continue
        }

        // Create execution record
        const execution: WorkflowExecution = {
          id: generateId(),
          workflowId: workflow.id,
          trigger,
          triggerData,
          status: "running",
          startedAt: new Date().toISOString(),
          results: [],
        }

        // Store execution record
        await redis.hset(WORKFLOW_EXECUTIONS_KEY, execution.id, JSON.stringify(execution))

        // Execute actions
        for (const actionConfig of workflow.actions) {
          try {
            const result = await this.executeAction(actionConfig, triggerData, businessId)
            execution.results.push(result)
          } catch (error) {
            logger.error(`Failed to execute action ${actionConfig.type}:`, error)
            execution.results.push({
              type: actionConfig.type,
              status: "failed",
              message: error.message,
            })
          }
        }

        // Update execution status
        execution.status = execution.results.some((result) => result.status === "failed") ? "failed" : "completed"
        execution.completedAt = new Date().toISOString()

        // Update execution record
        await redis.hset(WORKFLOW_EXECUTIONS_KEY, execution.id, JSON.stringify(execution))

        // Update workflow last run timestamp
        await this.updateWorkflow(workflow.id, { lastRunAt: new Date().toISOString() })

        executions.push(execution)
      }

      return executions
    } catch (error) {
      logger.error(`Failed to trigger workflow for ${trigger}:`, error)
      return []
    }
  }

  /**
   * Evaluate trigger conditions
   */
  private static evaluateTriggerConditions(conditions: Record<string, any>, triggerData: Record<string, any>): boolean {
    try {
      // Simple condition evaluation
      for (const [key, value] of Object.entries(conditions)) {
        const parts = key.split(".")
        let dataValue = triggerData

        // Navigate nested properties
        for (const part of parts) {
          if (dataValue === undefined || dataValue === null) {
            return false
          }
          dataValue = dataValue[part]
        }

        // Check condition
        if (typeof value === "object" && value !== null) {
          // Complex condition
          if (value.$gt !== undefined && !(dataValue > value.$gt)) return false
          if (value.$gte !== undefined && !(dataValue >= value.$gte)) return false
          if (value.$lt !== undefined && !(dataValue < value.$lt)) return false
          if (value.$lte !== undefined && !(dataValue <= value.$lte)) return false
          if (value.$ne !== undefined && dataValue === value.$ne) return false
          if (value.$in !== undefined && !value.$in.includes(dataValue)) return false
          if (value.$nin !== undefined && value.$nin.includes(dataValue)) return false
        } else {
          // Simple equality
          if (dataValue !== value) return false
        }
      }

      return true
    } catch (error) {
      logger.error("Failed to evaluate trigger conditions:", error)
      return false
    }
  }

  /**
   * Execute a workflow action
   */
  private static async executeAction(
    actionConfig: WorkflowActionConfig,
    triggerData: Record<string, any>,
    businessId: string,
  ): Promise<WorkflowActionResult> {
    try {
      switch (actionConfig.type) {
        case "send_email":
          // In a real implementation, this would send an email
          logger.info(`Sending email: ${JSON.stringify(actionConfig.config)}`)
          return {
            type: actionConfig.type,
            status: "success",
            message: "Email sent successfully",
          }

        case "send_sms":
          // In a real implementation, this would send an SMS
          logger.info(`Sending SMS: ${JSON.stringify(actionConfig.config)}`)
          return {
            type: actionConfig.type,
            status: "success",
            message: "SMS sent successfully",
          }

        case "generate_report":
          // In a real implementation, this would generate a report
          logger.info(`Generating report: ${JSON.stringify(actionConfig.config)}`)
          return {
            type: actionConfig.type,
            status: "success",
            message: "Report generated successfully",
          }

        case "create_purchase_order":
          // In a real implementation, this would create a purchase order
          logger.info(`Creating purchase order: ${JSON.stringify(actionConfig.config)}`)
          return {
            type: actionConfig.type,
            status: "success",
            message: "Purchase order created successfully",
          }

        case "update_inventory":
          // In a real implementation, this would update inventory
          logger.info(`Updating inventory: ${JSON.stringify(actionConfig.config)}`)
          return {
            type: actionConfig.type,
            status: "success",
            message: "Inventory updated successfully",
          }

        case "notify_staff":
          // In a real implementation, this would notify staff
          logger.info(`Notifying staff: ${JSON.stringify(actionConfig.config)}`)
          return {
            type: actionConfig.type,
            status: "success",
            message: "Staff notified successfully",
          }

        default:
          throw new Error(`Unsupported action type: ${actionConfig.type}`)
      }
    } catch (error) {
      logger.error(`Failed to execute action ${actionConfig.type}:`, error)
      return {
        type: actionConfig.type,
        status: "failed",
        message: error.message,
      }
    }
  }

  /**
   * Get workflow executions
   */
  static async getWorkflowExecutions(workflowId: string, limit = 10): Promise<WorkflowExecution[]> {
    try {
      const executionsData = await redis.hgetall(WORKFLOW_EXECUTIONS_KEY)

      if (!executionsData) {
        return []
      }

      return Object.values(executionsData)
        .map((data) => JSON.parse(data as string) as WorkflowExecution)
        .filter((execution) => execution.workflowId === workflowId)
        .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
        .slice(0, limit)
    } catch (error) {
      logger.error(`Failed to get executions for workflow ${workflowId}:`, error)
      return []
    }
  }
}

