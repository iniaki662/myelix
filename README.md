[English] · [简体中文](README.zh-CN.md)

# Myelix

A tick-driven drive loop — decisions come from a simulated endocrine system, nothing else.

```ts
const myelix = createMyelix()
myelix.tickRunner.run() // no prompt, no input
```

No LLM. No ML framework. No external API. The agent acts because its simulated body compels it to.

**Important**: Myelix is only a drive layer (body). It has no cognition, no planning, no evaluation, no world model.
It demonstrates one thing: internal drive alone is sufficient to generate autonomous behavior.

## Core Loop

```
desire grows → compete → strongest wins → action → satisfy → hormone feedback → next tick
```

## Demo

```bash
pnpm install
pnpm demo
```

Output (60 autonomous ticks, ~instant):

```
Tick  Hormones                     Strongest Desire   Action
─────────────────────────────────────────────────────────────
  1   D0.50 S0.60 O0.30 C0.20      nourishment        rest
  2   D0.47 S0.64 O0.29 C0.04      nourishment        forage
  3   D0.55 S0.66 O0.29 C0.04      mastery            practice
  4   D0.58 S0.64 O0.28 C0.12      rest               rest
  5   D0.55 S0.68 O0.28 C0.00      social             socialize
  ...
 60   D0.77 S0.86 O0.83 C0.09      nourishment        forage

Action distribution: rest 23%  explore 20%  socialize 20%  forage 18%  practice 18%
Action changes: 59 / 60 ticks
```

## Architecture

```
createMyelix()
  ├─ EventBus         — Priority pub/sub (internal signaling)
  ├─ Body (drive layer)
  │   ├─ HormoneSystem — dopamine · serotonin · oxytocin · cortisol
  │   │                  sine-wave oscillator + exponential decay
  │   └─ DesireSystem  — exploration · social · nourishment · rest · mastery
  │                      intrinsic growth + hormone modulation
  ├─ TickRunner       — tick execution loop
  └─ StateBuffer      — 2304D state vector, 6 semantic regions × 384 floats
```

### Usage as Library

```ts
import { createMyelix } from 'myelix'

const agent = createMyelix()

for (let i = 0; i < 60; i++) {
  const result = await agent.tickRunner.run()
  console.log(result.action.id, result.body.hormones)
}
```

### Tick Cycle

1. **Sense** — Update hormones and desires, write to StateBuffer
2. **Act** — Select action matching the strongest desire
3. **Feedback** — Apply action consequences to hormones and desires

## Design

Myelix is a minimal subset of a larger cognitive architecture. It extracts only the hormone-desire-action feedback loop — the lowest layer that generates autonomous behavior.

**What Myelix does not have:**
- No evaluation or planning
- No world model or memory
- No metacognition or self-reflection
- No ability to assess external information (e.g. LLM output)
- The StateBuffer is written to but not used for decision-making

This is not a complete agent. It is a drive system made runnable in isolation to demonstrate the concept.

### Influences

- **Active Inference** (Friston) — desire-driven action selection
- **Affective Neuroscience** (Panksepp) — hormone-grounded desire systems

### Docs

- [`docs/architecture.md`](docs/architecture.md) — Module map, data flow
- [`docs/behavior-mapping.md`](docs/behavior-mapping.md) — Hormone-desire-action parameter tables

## License

MIT
