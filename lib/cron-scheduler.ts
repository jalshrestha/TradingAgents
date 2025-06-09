import * as cron from 'node-cron'
import { runStockTradesScraper } from './scrapers'

export class CronScheduler {
  private tasks: Map<string, cron.ScheduledTask> = new Map()

  constructor() {
    this.setupDefaultTasks()
  }

  private setupDefaultTasks(): void {
    // Daily scraping at 6 AM EST (11 AM UTC)
    this.scheduleTask('daily-scrape', '0 11 * * *', async () => {
      console.log('Starting daily automated scraping...')
      try {
        const result = await runStockTradesScraper({ maxPages: 5 })
        console.log('Daily scraping completed:', result)
        
        // Optional: Send notification or alert if many errors
        if (result.errors.length > 3) {
          console.warn('Daily scraping had multiple errors:', result.errors)
        }
      } catch (error) {
        console.error('Daily scraping failed:', error)
      }
    })

    // Weekly deep scrape on Sundays at 3 AM EST (8 AM UTC)
    this.scheduleTask('weekly-deep-scrape', '0 8 * * 0', async () => {
      console.log('Starting weekly deep scraping...')
      try {
        const result = await runStockTradesScraper({ maxPages: 10 })
        console.log('Weekly deep scraping completed:', result)
      } catch (error) {
        console.error('Weekly deep scraping failed:', error)
      }
    })

    console.log('Cron scheduler initialized with default tasks')
  }

  scheduleTask(name: string, cronExpression: string, task: () => Promise<void>): void {
    // Stop existing task if it exists
    this.stopTask(name)

    try {
      const scheduledTask = cron.schedule(cronExpression, task, {
        scheduled: true,
        timezone: 'America/New_York' // EST timezone
      })

      this.tasks.set(name, scheduledTask)
      console.log(`Scheduled task '${name}' with expression '${cronExpression}'`)
    } catch (error) {
      console.error(`Failed to schedule task '${name}':`, error)
    }
  }

  stopTask(name: string): void {
    const task = this.tasks.get(name)
    if (task) {
      task.stop()
      this.tasks.delete(name)
      console.log(`Stopped task '${name}'`)
    }
  }

  stopAllTasks(): void {
    for (const [name, task] of this.tasks) {
      task.stop()
      console.log(`Stopped task '${name}'`)
    }
    this.tasks.clear()
  }

  getTaskStatus(): Array<{ name: string, isRunning: boolean }> {
    return Array.from(this.tasks.entries()).map(([name, task]) => ({
      name,
      isRunning: task.getStatus() === 'scheduled'
    }))
  }

  // Manual trigger for testing
  async triggerDailyScrape(): Promise<void> {
    console.log('Manually triggering daily scrape...')
    try {
      const result = await runStockTradesScraper({ maxPages: 3 })
      console.log('Manual scrape completed:', result)
    } catch (error) {
      console.error('Manual scrape failed:', error)
      throw error
    }
  }
}

// Global scheduler instance
let globalScheduler: CronScheduler | null = null

export function getCronScheduler(): CronScheduler {
  if (!globalScheduler) {
    globalScheduler = new CronScheduler()
  }
  return globalScheduler
}

// Initialize scheduler only in production or when explicitly requested
export function initializeCronScheduler(): CronScheduler {
  const scheduler = getCronScheduler()
  console.log('Cron scheduler ready')
  return scheduler
} 