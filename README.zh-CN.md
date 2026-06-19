# Myelix

一个 tick 驱动的驱动力闭环 — 所有决策来自模拟内分泌系统，仅此而已。

```ts
const myelix = createMyelix()
myelix.tickRunner.run() // 无需提示，无需输入
```

无 LLM。无 ML 框架。无外部 API。智能体行动因为它的模拟身体驱使它行动。

**重要**: Myelix 只有驱动力层（身体）。没有认知、没有规划、没有评估、没有世界模型。
它只证明一件事：内在驱动足以产生自主行为。

## 核心循环

```
欲望增长 → 竞争 → 最强胜出 → 行动 → 满足 → 激素反馈 → 下一 tick
```

## 演示

```bash
pnpm install
pnpm demo
```

输出 (60 个自主 tick，瞬间完成):

```
Tick  Hormones                     Strongest Desire   Action
─────────────────────────────────────────────────────────────
  1   D0.50 S0.60 O0.30 C0.20      饥饿               休息
  2   D0.47 S0.64 O0.29 C0.04      饥饿               觅食
  3   D0.55 S0.66 O0.29 C0.04      精通               练习
  4   D0.58 S0.64 O0.28 C0.12      休息               休息
  5   D0.55 S0.68 O0.28 C0.00      社交               社交
  ...
 60   D0.77 S0.86 O0.83 C0.09      饥饿               觅食

动作分布: 休息 23%  探索 20%  社交 20%  觅食 18%  练习 18%
动作切换: 59 / 60 ticks
```

## 架构

```
createMyelix()
  ├─ EventBus         — 优先级发布/订阅 (内部信号)
  ├─ Body (驱动力层)
  │   ├─ HormoneSystem — 多巴胺 · 血清素 · 催产素 · 皮质醇
  │   │                 正弦波振荡器 + 指数衰减
  │   └─ DesireSystem  — 探索 · 社交 · 饥饿 · 休息 · 精通
  │                     内在增长 + 激素调制
  ├─ TickRunner       — tick 执行循环
  └─ StateBuffer      — 2304 维状态缓冲区，6 个语义区域 × 384 浮点数
```

### 作为库使用

```ts
import { createMyelix } from 'myelix'

const agent = createMyelix()

for (let i = 0; i < 60; i++) {
  const result = await agent.tickRunner.run()
  console.log(result.action.id, result.body.hormones)
}
```

### Tick 循环

1. **感知** — 更新激素和欲望状态，写入 StateBuffer
2. **行动** — 选择当前最强的欲望对应的动作
3. **反馈** — 根据动作结果更新激素和欲望

## 设计理念

Myelix 是一个更大认知架构的最小化提取。它只提取了激素-欲望-动作反馈闭环 — 产生自主行为的最底层。

**Myelix 不具备:**
- 评估或规划能力
- 世界模型或记忆
- 元认知或自我反思
- 评估外部信息的能力（如 LLM 输出）
- StateBuffer 只写入，不参与决策

这不是一个完整的智能体。这是一个被隔离运行的驱动力系统，用于概念演示。

### 理论影响

- **主动推理** (Friston) — 欲望驱动的动作选择
- **情感神经科学** (Panksepp) — 基于激素的欲望系统

### 文档

- [`docs/architecture.zh-CN.md`](docs/architecture.zh-CN.md) — 模块图、数据流
- [`docs/behavior-mapping.zh-CN.md`](docs/behavior-mapping.zh-CN.md) — 激素-欲望-动作参数表

## 许可

MIT
