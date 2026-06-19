# Autonomous Behavior Mapping

Internal state → action decision mapping for the drive layer (body) only.

**Note**: This system has no evaluation or planning. The mapping below is purely mechanical — hormone levels influence desire growth, desires compete by magnitude, and the strongest determines the action.

## Overview

```
Hormones → modulate → Desires → compete → strongest wins → Action → feedback → Hormones
```

No external input, no LLM, no reward function. The agent acts because its internal state compels it to.

---

## Hormone Dynamics

4 hormones oscillate independently via sine wave + exponential decay + synthesis.

| Hormone | Base | Half-life | Amplitude | Period | Synthesis | Role |
|---------|------|-----------|-----------|--------|-----------|------|
| Dopamine | 0.5 | 12 | 0.30 | 24 | 0.020 | Reward/anticipation |
| Serotonin | 0.6 | 20 | 0.15 | 40 | 0.010 | Contentment/stability |
| Oxytocin | 0.3 | 30 | 0.25 | 60 | 0.005 | Bonding/trust |
| Cortisol | 0.2 | 8 | 0.35 | 24 | 0.030 | Stress/arousal |

Update formula per tick:
```
decay = 0.5^(1/halfLife)
oscillation = amplitude * sin(2π * tick / period)
target = base + oscillation
decayed = current * decay
delta = synthesis * sign(target - decayed) * min(|target - decayed|, 0.1)
new = clamp(decayed + delta, 0, 1)
```

---

## Desire Dynamics

5 desires with intrinsic growth and hormone modulation.

| Desire | Growth/tick | Decay on satisfy | Hormone modulation |
|--------|------------|-------------------|-------------------|
| Exploration | +0.020 | ×0.50 | none |
| Social | +0.015 | ×0.40 | none |
| Nourishment | +0.025 | ×0.60 | none |
| Rest | +0.018 | ×0.55 | +cortisol × 0.3 |
| Mastery | +0.012 | ×0.35 | none |

Update per tick:
```
intensity = min(1, intensity + growthRate)
if (Rest): intensity = min(1, intensity + cortisol * 0.3)
```

Satisfaction (when action executed):
```
intensity = max(0, intensity * (1 - decayRate) + random(0, 0.05))
```

---

## Action Selection

1. `getStrongest()` — pick desire with highest intensity
2. Filter actions by `satisfies` array
3. Random pick among candidates (ensures variety)

| Desire | Candidate Actions |
|--------|------------------|
| Exploration | explore |
| Social | socialize |
| Nourishment | forage |
| Rest | rest |
| Mastery | practice |

---

## Action → Feedback

| Action | Satisfies | Hormone effect |
|--------|-----------|---------------|
| explore | Exploration | dopamine +0.08, cortisol +0.03 |
| socialize | Social | oxytocin +0.12, serotonin +0.05 |
| forage | Nourishment | dopamine +0.10, serotonin +0.04 |
| rest | Rest | cortisol -0.15, serotonin +0.06 |
| practice | Mastery | dopamine +0.06, cortisol +0.08 |

Feedback formula:
```
desire.intensity *= (1 - desire.decayRate)    // satisfaction
hormone.level += hormoneEffect                 // hormone update
hormone.level = clamp(hormone.level, 0, 1)
```

---

## Emergent Behavior Patterns

Because desires grow continuously and are only partially satisfied (×0.4–0.65 remaining after satisfaction), multiple desires stay active simultaneously. The strongest desire changes as satisfaction and hormone feedback shift the internal landscape.

Observed patterns from 60-tick runs:
- **Action switching** — agent changes action on nearly every tick (59/60)
- **Uniform distribution** — actions are spread 15–25% each, no single action dominates
- **Hormone drift** — dopamine/serotonin/oxytocin rise over time (growth > decay), cortisol stays low (rest resets it)
- **Self-regulation** — when cortisol spikes (from explore/practice), rest becomes more attractive via the cortisol boost, naturally pulling the system back to equilibrium
