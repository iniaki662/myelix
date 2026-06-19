import { type BodyState, type HormoneState, type DesireState, type Action, Region } from './types'
import { HormoneSystem } from './hormone'
import { DesireSystem, ACTIONS } from './desire'
import { writeRegionValue, getRegionRMS } from './buffer'

export class Body {
  readonly hormones: HormoneSystem
  readonly desires: DesireSystem
  currentAction: Action | null = null
  private tickCount = 0

  constructor() {
    this.hormones = new HormoneSystem()
    this.desires = new DesireSystem()
  }

  tick(buf: Float64Array): BodyState {
    this.tickCount++
    const hormoneState = this.hormones.tick(this.tickCount)
    const desireStates = this.desires.tick(hormoneState)

    this.expressToBuffer(buf, hormoneState, desireStates)

    const action = this.selectAction()
    this.currentAction = action

    return {
      hormones: hormoneState,
      desires: desireStates,
      currentAction: action,
      tick: this.tickCount,
    }
  }

  applyFeedback(action: Action): void {
    for (const type of action.satisfies) {
      this.desires.satisfy(type)
    }
    this.hormones.applyEffect(action.hormoneEffects)
  }

  getState(): BodyState {
    return {
      hormones: this.hormones.getState(),
      desires: this.desires.getState(),
      currentAction: this.currentAction,
      tick: this.tickCount,
    }
  }

  reset(): void {
    this.hormones.reset()
    this.desires.reset()
    this.currentAction = null
    this.tickCount = 0
  }

  private selectAction(): Action {
    const strongest = this.desires.getStrongest()
    const candidates = ACTIONS.filter(a => a.satisfies.includes(strongest))
    if (candidates.length === 0) return ACTIONS[0]
    return candidates[Math.floor(Math.random() * candidates.length)]
  }

  private expressToBuffer(buf: Float64Array, hormones: HormoneState, desires: DesireState[]): void {
    writeRegionValue(buf, Region.SENSE, 0, hormones.dopamine)
    writeRegionValue(buf, Region.SENSE, 1, hormones.serotonin)
    writeRegionValue(buf, Region.SENSE, 2, hormones.oxytocin)
    writeRegionValue(buf, Region.SENSE, 3, hormones.cortisol)

    for (let i = 0; i < desires.length; i++) {
      writeRegionValue(buf, Region.THINK, i, desires[i].intensity)
    }
  }
}
