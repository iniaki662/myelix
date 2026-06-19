# Architecture

Myelix implements the body/drive layer only. No cognition, no planning, no evaluation.

## Module Map

```
┌──────────────────────────────────────────────────────────┐
│                    createMyelix()                         │
│  Factory — wires EventBus + Body + TickRunner together   │
├──────────────────────────────────────────────────────────┤
│                     TickRunner                            │
│  Tick execution loop: sense → act → feedback             │
│                                                          │
│  body.tick()       → advance hormones, desires, act      │
│  body.applyFeedback() → satisfy desire, update hormones  │
├──────────────────────────────────────────────────────────┤
│                        Body (drive layer)                  │
│  Owns HormoneSystem + DesireSystem.                       │
│  tick(buf): advance hormones → advance desires →          │
│             write to StateBuffer → select action          │
│  applyFeedback(): satisfy desire + apply hormone effects  │
├───────────────────────┬──────────────────────────────────┤
│   HormoneSystem       │       DesireSystem                │
│  4 hormones with      │  5 desires with intrinsic         │
│  sine oscillation +   │  growth, hormone modulation,      │
│  exponential decay    │  and satisfaction decay           │
├───────────────────────┴──────────────────────────────────┤
│                    EventBus                               │
│  Priority-based pub/sub for internal signaling.           │
├──────────────────────────────────────────────────────────┤
│                  StateBuffer (2304D)                      │
│  6 regions × 384 floats (SENSE | THINK | CONCEPT         │
│  | MODEL | ACT | REFLECT). Written but not used for      │
│  decision-making in this skeleton.                        │
└──────────────────────────────────────────────────────────┘
```

## Data Flow (1 Tick)

```
Body.tick(buf)
  ├─ HormoneSystem.tick(tickCount)
  │   └─ decay + sine oscillation + synthesis → new levels
  ├─ DesireSystem.tick(hormoneState)
  │   └─ intrinsic growth + cortisol boost (rest) → new intensities
  ├─ expressToBuffer(buf, hormones, desires)
  │   └─ write hormone levels → SENSE[0..3]
  │   └─ write desire levels → THINK[0..4]
  ├─ selectAction()
  │   └─ getStrongest() → filter actions by satisfies → random pick
  └─ return { hormones, desires, currentAction }

applyFeedback(action)
  ├─ desires.satisfy(type) → intensity *= (1 - decayRate)
  └─ hormones.applyEffect(hormoneEffects) → add delta
```

## File Layout

```
src/
  types.ts          — Type definitions and enums
  event-bus.ts      — Priority pub/sub (~95 lines)
  buffer.ts         — StateBuffer I/O (~70 lines)
  hormone.ts        — 4 hormone oscillators (~50 lines)
  desire.ts         — 5 desires + 5 actions (~110 lines)
  body.ts           — Integrates hormone+desire (~75 lines)
  tick-runner.ts    — Tick loop (~70 lines)
  create-myelix.ts  — Assembly factory (~17 lines)
  demo.ts           — 60-tick runnable demo (~130 lines)
```

## What Is Missing

Compared to a full cognitive architecture, Myelix omits:

- **Evaluation** — no way to judge whether an outcome is good or bad
- **World model** — no internal representation of the environment
- **Metacognition** — no self-reflection or strategy switching
- **Memory** — no persistent storage beyond current tick state
- **Planning** — no look-ahead or goal selection
- **External input processing** — no sensors, no ability to use LLM output
