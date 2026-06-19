import { EventBus } from './event-bus'
import { Body } from './body'
import { TickRunner } from './tick-runner'

export interface MyelixInstance {
  eventBus: EventBus
  body: Body
  tickRunner: TickRunner
}

export function createMyelix(): MyelixInstance {
  const eventBus = new EventBus()
  const body = new Body()
  const tickRunner = new TickRunner(eventBus, body)

  return { eventBus, body, tickRunner }
}
