import { DesireType, type DesireState, type Action, type HormoneState } from './types'

interface DesireInternal {
  type: DesireType
  intensity: number
  growthRate: number
  decayRate: number
}

const DESIRE_CONFIGS: Record<DesireType, { growthRate: number; decayRate: number }> = {
  [DesireType.EXPLORATION]:  { growthRate: 0.020, decayRate: 0.50 },
  [DesireType.SOCIAL]:       { growthRate: 0.015, decayRate: 0.40 },
  [DesireType.NOURISHMENT]:  { growthRate: 0.025, decayRate: 0.60 },
  [DesireType.REST]:         { growthRate: 0.018, decayRate: 0.55 },
  [DesireType.MASTERY]:      { growthRate: 0.012, decayRate: 0.35 },
}

export const ACTIONS: Action[] = [
  {
    id: 'explore',
    name: 'Explore',
    description: 'Move to a new area and gather information',
    satisfies: [DesireType.EXPLORATION],
    hormoneEffects: { dopamine: 0.08, cortisol: 0.03 },
  },
  {
    id: 'socialize',
    name: 'Socialize',
    description: 'Interact with others and build bonds',
    satisfies: [DesireType.SOCIAL],
    hormoneEffects: { oxytocin: 0.12, serotonin: 0.05 },
  },
  {
    id: 'forage',
    name: 'Forage',
    description: 'Search for and consume resources',
    satisfies: [DesireType.NOURISHMENT],
    hormoneEffects: { dopamine: 0.10, serotonin: 0.04 },
  },
  {
    id: 'rest',
    name: 'Rest',
    description: 'Recover energy and reduce stress',
    satisfies: [DesireType.REST],
    hormoneEffects: { cortisol: -0.15, serotonin: 0.06 },
  },
  {
    id: 'practice',
    name: 'Practice',
    description: 'Train a skill and improve competence',
    satisfies: [DesireType.MASTERY],
    hormoneEffects: { dopamine: 0.06, cortisol: 0.08 },
  },
]

export class DesireSystem {
  private desires: DesireInternal[]

  constructor() {
    this.desires = Object.values(DesireType).map(type => ({
      type,
      intensity: 0.1 + Math.random() * 0.3,
      ...DESIRE_CONFIGS[type],
    }))
  }

  tick(hormones: HormoneState): DesireState[] {
    for (const d of this.desires) {
      d.intensity = Math.min(1, d.intensity + d.growthRate)

      if (d.type === DesireType.REST) {
        const cortisolInfluence = hormones.cortisol * 0.3
        d.intensity = Math.min(1, d.intensity + cortisolInfluence)
      }
    }
    return this.desires.map(d => ({ type: d.type, intensity: Math.round(d.intensity * 1000) / 1000 }))
  }

  getStrongest(): DesireType {
    let max = -1
    let best = this.desires[0].type
    for (const d of this.desires) {
      if (d.intensity > max) {
        max = d.intensity
        best = d.type
      }
    }
    return best
  }

  satisfy(type: DesireType): void {
    const d = this.desires.find(d => d.type === type)
    if (d) {
      d.intensity = Math.max(0, d.intensity * (1 - d.decayRate) + Math.random() * 0.05)
    }
  }

  getState(): DesireState[] {
    return this.desires.map(d => ({ type: d.type, intensity: Math.round(d.intensity * 1000) / 1000 }))
  }

  reset(): void {
    for (const d of this.desires) {
      d.intensity = 0.1 + Math.random() * 0.3
    }
  }
}
