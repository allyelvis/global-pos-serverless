"use server"
import { logger } from "../logger"

export interface OfflineSettings {
  enabled: boolean
  syncInterval: number // in minutes
  maxOfflineTransactions: number
  allowNewCustomers: boolean
  allowDiscounts: boolean
  allowReturns: boolean
}

export interface OfflineTransaction {
  id: string
  type: "sale" | "return" | "void"
  data: any
  createdAt: string
  syncedAt?: string
  syncStatus: "pending" | "synced" | "failed"
  syncError?: string
}

export class OfflineModeService {
  /**
   * Get default offline settings
   */
  static getDefaultSettings(): OfflineSettings {
    return {
      enabled: true,
      syncInterval: 15, // 15 minutes
      maxOfflineTransactions: 1000,
      allowNewCustomers: true,
      allowDiscounts: true,
      allowReturns: false,
    }
  }

  /**
   * Get client-side code for offline mode
   */
  static getClientScript(): string {
    // This would be the actual client-side code for offline mode
    // For now, we'll return a simplified version

    return `
      // Offline Mode Client Script
      
      // Initialize IndexedDB
      const initOfflineDB = async () => {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open('posOfflineDB', 1);
          
          request.onerror = (event) => {
            reject('Failed to open offline database');
          };
          
          request.onsuccess = (event) => {
            resolve(event.target.result);
          };
          
          request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create object stores
            db.createObjectStore('offlineTransactions', { keyPath: 'id' });
            db.createObjectStore('offlineProducts', { keyPath: 'id' });
            db.createObjectStore('offlineCustomers', { keyPath: 'id' });
            db.createObjectStore('offlineSettings', { keyPath: 'id' });
          };
        });
      };
      
      // Save transaction for offline sync
      const saveOfflineTransaction = async (transaction) => {
        const db = await initOfflineDB();
        const tx = db.transaction('offlineTransactions', 'readwrite');
        const store = tx.objectStore('offlineTransactions');
        
        transaction.syncStatus = 'pending';
        transaction.createdAt = new Date().toISOString();
        
        store.add(transaction);
        
        return new Promise((resolve, reject) => {
          tx.oncomplete = () => resolve(transaction);
          tx.onerror = () => reject('Failed to save offline transaction');
        });
      };
      
      // Sync offline transactions
      const syncOfflineTransactions = async () => {
        const db = await initOfflineDB();
        const tx = db.transaction('offlineTransactions', 'readonly');
        const store = tx.objectStore('offlineTransactions');
        
        const pendingTransactions = await new Promise((resolve, reject) => {
          const request = store.index('syncStatus').getAll('pending');
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject('Failed to get pending transactions');
        });
        
        // Process each transaction
        for (const transaction of pendingTransactions) {
          try {
            // Send to server
            const response = await fetch('/api/offline/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(transaction)
            });
            
            if (response.ok) {
              // Update transaction status
              const updateTx = db.transaction('offlineTransactions', 'readwrite');
              const updateStore = updateTx.objectStore('offlineTransactions');
              
              transaction.syncStatus = 'synced';
              transaction.syncedAt = new Date().toISOString();
              
              updateStore.put(transaction);
            } else {
              throw new Error('Sync failed');
            }
          } catch (error) {
            // Mark as failed
            const updateTx = db.transaction('offlineTransactions', 'readwrite');
            const updateStore = updateTx.objectStore('offlineTransactions');
            
            transaction.syncStatus = 'failed';
            transaction.syncError = error.message;
            
            updateStore.put(transaction);
          }
        }
      };
      
      // Check connection status
      const isOnline = () => {
        return navigator.onLine;
      };
      
      // Initialize offline mode
      const initOfflineMode = async () => {
        await initOfflineDB();
        
        // Set up event listeners
        window.addEventListener('online', syncOfflineTransactions);
        
        // Sync on startup if online
        if (isOnline()) {
          syncOfflineTransactions();
        }
      };
      
      // Export functions
      window.posOfflineMode = {
        initOfflineMode,
        saveOfflineTransaction,
        syncOfflineTransactions,
        isOnline
      };
    `
  }

  /**
   * Process synced offline transactions
   */
  static async processSyncedTransactions(transactions: OfflineTransaction[]): Promise<{
    success: boolean
    processed: number
    failed: number
    errors: string[]
  }> {
    try {
      let processed = 0
      let failed = 0
      const errors: string[] = []

      for (const transaction of transactions) {
        try {
          // Process based on transaction type
          switch (transaction.type) {
            case "sale":
              // Process sale
              // In a real implementation, this would call the appropriate service
              logger.info(`Processing offline sale: ${transaction.id}`)
              processed++
              break

            case "return":
              // Process return
              logger.info(`Processing offline return: ${transaction.id}`)
              processed++
              break

            case "void":
              // Process void
              logger.info(`Processing offline void: ${transaction.id}`)
              processed++
              break

            default:
              throw new Error(`Unknown transaction type: ${transaction.type}`)
          }
        } catch (error) {
          logger.error(`Failed to process offline transaction ${transaction.id}:`, error)
          failed++
          errors.push(`Transaction ${transaction.id}: ${error.message}`)
        }
      }

      return {
        success: failed === 0,
        processed,
        failed,
        errors,
      }
    } catch (error) {
      logger.error("Failed to process synced transactions:", error)
      return {
        success: false,
        processed: 0,
        failed: transactions.length,
        errors: [error.message],
      }
    }
  }
}

