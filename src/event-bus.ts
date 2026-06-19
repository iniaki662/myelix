import { EventPriority, type EventHandler, type PublishResult } from './types'

interface Subscription {
  id: string
  event: string
  handler: EventHandler
  priority: EventPriority
}

interface PendingEvent {
  event: string
  data: unknown
  priority: EventPriority
}

let subCounter = 0

export class EventBus {
  private subscriptions: Map<string, Subscription[]> = new Map()
  private pending: PendingEvent[] = []
  private maxPending = 256
  private disposed = false

  subscribe(event: string, handler: EventHandler, priority: EventPriority = EventPriority.NORMAL): string {
    const id = `sub_${++subCounter}`
    const sub: Subscription = { id, event, handler, priority }
    const subs = this.subscriptions.get(event) || []
    subs.push(sub)
    this.subscriptions.set(event, subs)
    return id
  }

  unsubscribe(id: string): boolean {
    for (const [, subs] of this.subscriptions) {
      const idx = subs.findIndex(s => s.id === id)
      if (idx !== -1) {
        subs.splice(idx, 1)
        return true
      }
    }
    return false
  }

  publish(event: string, data: unknown, priority: EventPriority = EventPriority.NORMAL): PublishResult {
    if (this.disposed) return { handled: 0, dropped: 0 }

    const subs = this.subscriptions.get(event)
    if (!subs || subs.length === 0) {
      this.enqueuePending(event, data, priority)
      return { handled: 0, dropped: 0 }
    }

    let handled = 0
    const sorted = [...subs].sort((a, b) => a.priority - b.priority)
    for (const sub of sorted) {
      try {
        const result = sub.handler(event, data)
        if (result instanceof Promise) {
          result.catch(err => console.error(`[EventBus] handler error:`, err))
        }
        handled++
      } catch (err) {
        console.error(`[EventBus] handler error:`, err)
      }
    }
    return { handled, dropped: 0 }
  }

  flushPending(): void {
    if (this.pending.length === 0) return
    const batch = [...this.pending].sort((a, b) => a.priority - b.priority)
    this.pending = []
    for (const pe of batch) {
      this.publish(pe.event, pe.data, pe.priority)
    }
  }

  clear(): void {
    this.subscriptions.clear()
    this.pending = []
  }

  dispose(): void {
    this.disposed = true
    this.clear()
  }

  private enqueuePending(event: string, data: unknown, priority: EventPriority): void {
    if (this.pending.length >= this.maxPending) {
      this.pending.sort((a, b) => b.priority - a.priority)
      this.pending.pop()
    }
    this.pending.push({ event, data, priority })
  }
}
