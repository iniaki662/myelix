export const BUFFER_SIZE = 2304
export const REGION_SIZE = 384

export enum Region {
  SENSE = 0,
  THINK = 1,
  CONCEPT = 2,
  MODEL = 3,
  ACT = 4,
  REFLECT = 5,
}

export enum HormoneType {
  DOPAMINE = 'dopamine',
  SEROTONIN = 'serotonin',
  OXYTOCIN = 'oxytocin',
  CORTISOL = 'cortisol',
}

export interface HormoneConfig {
  baseLevel: number
  halfLifeTicks: number
  oscillationAmplitude: number
  oscillationPeriod: number
  synthesisRate: number
}

export interface HormoneState {
  dopamine: number
  serotonin: number
  oxytocin: number
  cortisol: number
}

export interface HormoneSystemConfig {
  tickRate?: number
}

export enum DesireType {
  EXPLORATION = 'exploration',
  SOCIAL = 'social',
  NOURISHMENT = 'nourishment',
  REST = 'rest',
  MASTERY = 'mastery',
}

export interface DesireConfig {
  growthRate: number
  decayRate: number
  satisfactionThreshold: number
  urgencyThreshold: number
}

export interface DesireState {
  type: DesireType
  intensity: number
}

export interface Action {
  id: string
  name: string
  description: string
  satisfies: DesireType[]
  hormoneEffects: Partial<HormoneState>
}

export interface BodyState {
  hormones: HormoneState
  desires: DesireState[]
  currentAction: Action | null
  tick: number
}

export interface TickResult {
  tick: number
  body: BodyState
  action: Action | null
}

export enum EventPriority {
  CORE = 0,
  HIGH = 1,
  NORMAL = 2,
  LOW = 3,
}

export type EventHandler = (event: string, data: unknown) => void | Promise<void>

export function regionOffset(region: Region): number {
  return region * REGION_SIZE
}

export interface PublishResult {
  handled: number
  dropped: number
}
