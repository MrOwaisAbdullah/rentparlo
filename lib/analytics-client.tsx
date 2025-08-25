/**
 * Frontend Analytics Utility
 * Handles client-side analytics tracking
 */

import React from 'react'

interface AnalyticsEvent {
  listingId: string
  eventType: 'view' | 'contact_click' | 'WhatsApp_click' | 'share' | 'save' | 'search' | 'listing_click' | 'impressions'
  userId?: string
  additionalData?: Record<string, any>
}

class AnalyticsClient {
  private queue: AnalyticsEvent[] = []
  private isOnline = true
  private batchTimeout: NodeJS.Timeout | null = null

  constructor() {
    // Monitor online status
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine
      window.addEventListener('online', () => {
        this.isOnline = true
        this.flushQueue()
      })
      window.addEventListener('offline', () => {
        this.isOnline = false
      })

      // Flush queue before page unload
      window.addEventListener('beforeunload', () => {
        this.flushQueue()
      })
    }
  }

  /**
   * Track a single analytics event
   */
  async track(event: AnalyticsEvent): Promise<boolean> {
    try {
      // Add to queue for offline support
      this.queue.push(event)

      // If online, try to send immediately
      if (this.isOnline) {
        return await this.sendEvent(event)
      }

      return true // Queued successfully
    } catch (error) {
      console.error('Analytics tracking error:', error)
      return false
    }
  }

  /**
   * Track listing view
   */
  async trackView(listingId: string, userId?: string, additionalData?: Record<string, any>): Promise<boolean> {
    return this.track({
      listingId,
      eventType: 'view',
      userId,
      additionalData: {
        ...additionalData,
        timestamp: Date.now(),
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined
      }
    })
  }

  /**
   * Track contact click
   */
  async trackContactClick(listingId: string, contactType: 'phone' | 'whatsapp' | 'email' = 'phone', userId?: string): Promise<boolean> {
    const eventType = contactType === 'whatsapp' ? 'WhatsApp_click' : 'contact_click'
    
    return this.track({
      listingId,
      eventType,
      userId,
      additionalData: {
        contactType,
        timestamp: Date.now()
      }
    })
  }

  /**
   * Track search query
   */
  async trackSearch(query: string, filters?: Record<string, any>, userId?: string): Promise<boolean> {
    return this.track({
      listingId: 'search', // Special identifier for search events
      eventType: 'search',
      userId,
      additionalData: {
        query,
        filters,
        timestamp: Date.now()
      }
    })
  }

  /**
   * Track listing share
   */
  async trackShare(listingId: string, platform: string, userId?: string): Promise<boolean> {
    return this.track({
      listingId,
      eventType: 'share',
      userId,
      additionalData: {
        platform,
        timestamp: Date.now()
      }
    })
  }

  /**
   * Track listing save/favorite
   */
  async trackSave(listingId: string, userId?: string): Promise<boolean> {
    return this.track({
      listingId,
      eventType: 'save',
      userId,
      additionalData: {
        timestamp: Date.now()
      }
    })
  }

  /**
   * Batch track multiple events
   */
  async trackBatch(events: AnalyticsEvent[]): Promise<boolean> {
    try {
      if (!this.isOnline || events.length === 0) {
        this.queue.push(...events)
        return true
      }

      const response = await fetch('/api/analytics', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return true
    } catch (error) {
      console.error('Batch analytics tracking error:', error)
      // Add to queue for retry
      this.queue.push(...events)
      return false
    }
  }

  /**
   * Send a single event to the API
   */
  private async sendEvent(event: AnalyticsEvent): Promise<boolean> {
    try {
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Remove from queue if successful
      const index = this.queue.indexOf(event)
      if (index > -1) {
        this.queue.splice(index, 1)
      }

      return true
    } catch (error) {
      console.error('Single event tracking error:', error)
      return false
    }
  }

  /**
   * Flush the queue of pending events
   */
  private async flushQueue(): Promise<void> {
    if (this.queue.length === 0 || !this.isOnline) {
      return
    }

    const eventsToSend = [...this.queue]
    this.queue = []

    // Send in batches of 10
    const batchSize = 10
    for (let i = 0; i < eventsToSend.length; i += batchSize) {
      const batch = eventsToSend.slice(i, i + batchSize)
      await this.trackBatch(batch)
    }
  }

  /**
   * Schedule a batch flush
   */
  private scheduleBatchFlush(): void {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout)
    }

    this.batchTimeout = setTimeout(() => {
      this.flushQueue()
    }, 5000) // Flush every 5 seconds
  }

  /**
   * Get device information
   */
  private getDeviceInfo() {
    if (typeof window === 'undefined') return {}

    const userAgent = navigator.userAgent
    let deviceType = 'desktop'
    
    if (/Mobile|Android|iPhone/.test(userAgent)) {
      deviceType = 'mobile'
    } else if (/iPad|Tablet/.test(userAgent)) {
      deviceType = 'tablet'
    }

    return {
      deviceType,
      userAgent: userAgent.substring(0, 200), // Limit length
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    }
  }

  /**
   * Track page view (for SPA navigation)
   */
  async trackPageView(path: string, userId?: string): Promise<boolean> {
    return this.track({
      listingId: 'page_view',
      eventType: 'view',
      userId,
      additionalData: {
        path,
        timestamp: Date.now(),
        ...this.getDeviceInfo()
      }
    })
  }
}

// Create singleton instance
export const analytics = new AnalyticsClient()

// React hook for easy usage
export function useAnalytics() {
  return {
    trackView: analytics.trackView.bind(analytics),
    trackContactClick: analytics.trackContactClick.bind(analytics),
    trackSearch: analytics.trackSearch.bind(analytics),
    trackShare: analytics.trackShare.bind(analytics),
    trackSave: analytics.trackSave.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics)
  }
}

// Higher-order component for automatic view tracking
export function withViewTracking<T extends { listingId?: string }>(
  Component: React.ComponentType<T>
) {
  return function TrackedComponent(props: T) {
    const { trackView } = useAnalytics()

    React.useEffect(() => {
      if (props.listingId) {
        trackView(props.listingId)
      }
    }, [props.listingId, trackView])

    return <Component {...props} />
  }
}

export default analytics