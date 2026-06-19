export { createMyelix } from './create-myelix'
export type { MyelixInstance } from './create-myelix'
export { EventBus } from './event-bus'
export { Body } from './body'
export { TickRunner } from './tick-runner'
export { HormoneSystem } from './hormone'
export { DesireSystem, ACTIONS } from './desire'
export {
  BUFFER_SIZE, REGION_SIZE, Region,
  type HormoneState, type DesireState,
  type Action, type BodyState, type TickResult,
  type EventHandler, type PublishResult,
  EventPriority, DesireType, HormoneType,
} from './types'
export {
  createBuffer, cloneBuffer, getRegionRMS, getRegionEnergy,
  bufferSnapshot, readRegion, writeRegion,
  writeRegionValue, readRegionValue, clearRegion, regionOffset,
} from './buffer'
