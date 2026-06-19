import { createMyelix } from './create-myelix'
import { type TickResult, type Action, type DesireState, type HormoneState } from './types'

function fmt(v: number): string {
  return v.toFixed(3)
}

function pad(s: string, n: number): string {
  return s.padEnd(n)
}

interface TickSnapshot {
  tick: number
  preActionDesires: DesireState[]
  preActionHormones: HormoneState
  action: Action | null
  postActionDesires: DesireState[]
  postActionHormones: HormoneState
}

function desireBar(desires: DesireState[]): string {
  const barLen = 16
  return desires.map(d => {
    const filled = Math.round(d.intensity * barLen)
    const bar = '█'.repeat(filled) + '░'.repeat(barLen - filled)
    return `  ${pad(d.type, 14)} ${bar} ${fmt(d.intensity)}`
  }).join('\n')
}

function hormoneLine(h: HormoneState): string {
  return `D${fmt(h.dopamine)} S${fmt(h.serotonin)} O${fmt(h.oxytocin)} C${fmt(h.cortisol)}`
}

async function main(): Promise<void> {
  console.log('╔══════════════════════════════════════════════════════════════╗')
  console.log('║               Myelix — Autonomous Agent Core                ║')
  console.log('║  Tick-driven agent with simulated hormones and desires.    ║')
  console.log('║  Every decision comes from internal drive alone.           ║')
  console.log('║  No LLM, no external input, no ML dependencies.            ║')
  console.log('╚══════════════════════════════════════════════════════════════╝')

  const myelix = createMyelix()
  const TOTAL_TICKS = 60
  const snapshots: TickSnapshot[] = []

  for (let i = 0; i < TOTAL_TICKS; i++) {
    const preHormones = { ...myelix.body.hormones.getState() }
    const preDesires = myelix.body.desires.getState().map(d => ({ ...d }))

    const result = await myelix.tickRunner.run()

    const postHormones = { ...myelix.body.hormones.getState() }
    const postDesires = myelix.body.desires.getState().map(d => ({ ...d }))

    snapshots.push({
      tick: result.tick,
      preActionDesires: preDesires,
      preActionHormones: preHormones,
      action: result.action,
      postActionDesires: postDesires,
      postActionHormones: postHormones,
    })
  }

  const header = `  ${pad('Tick', 5)} ${pad('Hormones', 32)} ${pad('Strongest Desire', 18)} ${pad('Intensity', 10)} Action`
  console.log()
  console.log('═══ 60-Tick Behavior Log ═══════════════════════════════════════════════════════')
  console.log(header)
  console.log('  ' + '─'.repeat(90))

  for (const snap of snapshots) {
    const strongest = snap.preActionDesires.reduce((a, b) => a.intensity > b.intensity ? a : b)
    console.log(
      `  ${pad(String(snap.tick), 5)} ${pad(hormoneLine(snap.preActionHormones), 32)} ${pad(strongest.type, 18)} ${pad(fmt(strongest.intensity), 10)} ${snap.action?.id ?? '—'}`
    )
  }

  console.log()
  console.log('═══ Hormone Trajectory (every 10 ticks) ════════════════════════════════════════')
  console.log(`  ${pad('Tick', 5)} ${pad('Dopamine', 10)} ${pad('Serotonin', 10)} ${pad('Oxytocin', 10)} ${pad('Cortisol', 10)}`)
  console.log('  ' + '─'.repeat(45))
  for (let i = 0; i < snapshots.length; i += 10) {
    const s = snapshots[i]
    const h = s.preActionHormones
    const dBar = '█'.repeat(Math.round(h.dopamine * 10))
    const sBar = '█'.repeat(Math.round(h.serotonin * 10))
    const oBar = '█'.repeat(Math.round(h.oxytocin * 10))
    const cBar = '█'.repeat(Math.round(h.cortisol * 10))
    console.log(`  ${pad(String(s.tick), 5)} ${pad(fmt(h.dopamine), 10)} ${pad(fmt(h.serotonin), 10)} ${pad(fmt(h.oxytocin), 10)} ${pad(fmt(h.cortisol), 10)}`)
    console.log(`  ${''.padEnd(5)} ${pad(dBar, 10)} ${pad(sBar, 10)} ${pad(oBar, 10)} ${pad(cBar, 10)}`)
  }

  const cycleCount = snapshots.filter((s, i) => i > 0 && s.action?.id !== snapshots[i - 1].action?.id).length
  const dominantDesires = new Map<string, number>()
  for (const s of snapshots) {
    const act = s.action?.id ?? 'none'
    dominantDesires.set(act, (dominantDesires.get(act) || 0) + 1)
  }
  const sortedActions = [...dominantDesires.entries()].sort((a, b) => b[1] - a[1])

  console.log()
  console.log('═══ Behavior Analysis ══════════════════════════════════════════════════════════')
  console.log(`  Total ticks:              ${TOTAL_TICKS}`)
  console.log(`  Action changes:           ${cycleCount} (autonomous decision switches)`)
  console.log(`  Action distribution:`)
  for (const [action, count] of sortedActions) {
    const pct = ((count / TOTAL_TICKS) * 100).toFixed(0)
    const bar = '█'.repeat(Math.round(count / TOTAL_TICKS * 40))
    console.log(`    ${pad(action, 14)} ${pad(count.toString(), 4)} (${pad(pct, 2)}%) ${bar}`)
  }

  const avgD = snapshots.reduce((s, n) => s + n.preActionHormones.dopamine, 0) / snapshots.length
  const avgS = snapshots.reduce((s, n) => s + n.preActionHormones.serotonin, 0) / snapshots.length
  const avgO = snapshots.reduce((s, n) => s + n.preActionHormones.oxytocin, 0) / snapshots.length
  const avgC = snapshots.reduce((s, n) => s + n.preActionHormones.cortisol, 0) / snapshots.length
  console.log(`  Avg hormone state:        D${fmt(avgD)} S${fmt(avgS)} O${fmt(avgO)} C${fmt(avgC)}`)

  console.log()
  console.log('╔══════════════════════════════════════════════════════════════╗')
  console.log('║  Agent ran autonomously for 60 ticks.                       ║')
  console.log('║  All decisions driven by internal hormone + desire state.   ║')
  console.log('║  The core loop: grow desire → select action → satisfy →     ║')
  console.log('║  feedback → hormone update → next cycle.                    ║')
  console.log('║  Core modules: EventBus, Body, HormoneSystem, DesireSystem, ║')
  console.log('║  TickRunner, StateBuffer (2304D).                           ║')
  console.log('╚══════════════════════════════════════════════════════════════╝')
}

main().catch(console.error)
