import { type BodyState, type Action, type TickResult } from './types'
import { createBuffer, cloneBuffer } from './buffer'
import { Body } from './body'
import { EventBus } from './event-bus'

export class TickRunner {
  private buf: Float64Array
  private body: Body
  private eventBus: EventBus
  private tickCount = 0
  private lastAction: Action | null = null

  constructor(eventBus: EventBus, body: Body) {
    this.eventBus = eventBus
    this.body = body
    this.buf = createBuffer()
  }

  async run(): Promise<TickResult> {
    this.tickCount++

    const bodyState = this.body.tick(this.buf)
    this.lastAction = bodyState.currentAction

    if (this.lastAction) {
      this.body.applyFeedback(this.lastAction)
    }

    return {
      tick: this.tickCount,
      body: this.body.getState(),
      action: this.lastAction,
    }
  }

  async runBatch(count: number): Promise<TickResult[]> {
    const results: TickResult[] = []
    for (let i = 0; i < count; i++) {
      results.push(await this.run())
    }
    return results
  }

  getBuffer(): Float64Array {
    return this.buf
  }

  getTickCount(): number {
    return this.tickCount
  }

  reset(): void {
    this.buf = createBuffer()
    this.body.reset()
    this.tickCount = 0
    this.lastAction = null
  }
}
