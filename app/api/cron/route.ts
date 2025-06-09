import { NextRequest, NextResponse } from 'next/server'
import { getCronScheduler } from '@/lib/cron-scheduler'

export async function GET() {
  try {
    const scheduler = getCronScheduler()
    const status = scheduler.getTaskStatus()
    
    return NextResponse.json({
      success: true,
      tasks: status
    })
  } catch (error) {
    console.error('Error getting cron status:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body
    
    const scheduler = getCronScheduler()
    
    switch (action) {
      case 'trigger-daily':
        await scheduler.triggerDailyScrape()
        return NextResponse.json({
          success: true,
          message: 'Daily scrape triggered successfully'
        })
        
      case 'stop-all':
        scheduler.stopAllTasks()
        return NextResponse.json({
          success: true,
          message: 'All cron tasks stopped'
        })
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Error managing cron jobs:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 