import { HormoneType, type HormoneState } from './types'

const DEFAULT_CONFIGS: Record<HormoneType, { base: number; halfLife: number; amplitude: number; period: number; synthesis: number }> = {
  [HormoneType.DOPAMINE]:  { base: 0.5, halfLife: 12, amplitude: 0.3, period: 24, synthesis: 0.02 },
  [HormoneType.SEROTONIN]: { base: 0.6, halfLife: 20, amplitude: 0.15, period: 40, synthesis: 0.01 },
  [HormoneType.OXYTOCIN]:  { base: 0.3, halfLife: 30, amplitude: 0.25, period: 60, synthesis: 0.005 },
  [HormoneType.CORTISOL]:  { base: 0.2, halfLife: 8,  amplitude: 0.35, period: 24, synthesis: 0.03 },
}

export class HormoneSystem {
  private levels: HormoneState = { dopamine: 0.5, serotonin: 0.6, oxytocin: 0.3, cortisol: 0.2 }

  reset(): void {
    this.levels = { dopamine: 0.5, serotonin: 0.6, oxytocin: 0.3, cortisol: 0.2 }
  }

  tick(tickCount: number): HormoneState {
    for (const type of Object.values(HormoneType)) {
      this.updateHormone(type, tickCount)
    }
    return { ...this.levels }
  }

  applyEffect(effects: Partial<HormoneState>): void {
    for (const [key, value] of Object.entries(effects)) {
      if (value !== undefined) {
        const current = this.levels[key as keyof HormoneState]
        this.levels[key as keyof HormoneState] = Math.max(0, Math.min(1, current + value))
      }
    }
  }

  getState(): HormoneState {
    return { ...this.levels }
  }

  private updateHormone(type: HormoneType, tickCount: number): void {
    const cfg = DEFAULT_CONFIGS[type]
    const key = type as keyof HormoneState

    const decay = Math.pow(0.5, 1 / cfg.halfLife)
    const oscillation = cfg.amplitude * Math.sin((2 * Math.PI * tickCount) / cfg.period)
    const synthesis = cfg.synthesis

    const current = this.levels[key]
    const decayed = current * decay
    const target = cfg.base + oscillation
    const diff = target - decayed
    this.levels[key] = Math.max(0, Math.min(1, decayed + synthesis * Math.sign(diff) * Math.min(Math.abs(diff), 0.1)))
  }
}
