# 架构

Myelix 只实现了身体/驱动力层。没有认知、规划、评估。

## 模块图

```
┌──────────────────────────────────────────────────────────┐
│                    createMyelix()                         │
│  工厂 — 将 EventBus + Body + TickRunner 组装在一起        │
├──────────────────────────────────────────────────────────┤
│                     TickRunner                            │
│  Tick 执行循环: 感知 → 行动 → 反馈                        │
│                                                          │
│  body.tick()       → 推进激素、欲望、行动                 │
│  body.applyFeedback() → 满足欲望、更新激素                │
├──────────────────────────────────────────────────────────┤
│                   Body (驱动力层)                          │
│  拥有 HormoneSystem + DesireSystem。                       │
│  tick(buf): 推进激素 → 推进欲望 →                         │
│             写入 StateBuffer → 选择动作                    │
│  applyFeedback(): 满足欲望 + 应用激素效果                  │
├───────────────────────┬──────────────────────────────────┤
│   HormoneSystem       │       DesireSystem                │
│  4 种激素，正弦振荡 +   │  5 种欲望，内在增长 +             │
│  指数衰减 + 合成        │  激素调制 + 满足衰减             │
├───────────────────────┴──────────────────────────────────┤
│                    EventBus                               │
│  基于优先级的发布/订阅，用于内部信号传递。                  │
├──────────────────────────────────────────────────────────┤
│                  StateBuffer (2304维)                     │
│  6 个区域 × 384 浮点数 (SENSE | THINK | CONCEPT         │
│  | MODEL | ACT | REFLECT)。在此骨架中只写入，不参与决策。 │
└──────────────────────────────────────────────────────────┘
```

## 数据流 (1 个 Tick)

```
Body.tick(buf)
  ├─ HormoneSystem.tick(tickCount)
  │   └─ 衰减 + 正弦振荡 + 合成 → 新水平
  ├─ DesireSystem.tick(hormoneState)
  │   └─ 内在增长 + 皮质醇提升(休息) → 新强度
  ├─ expressToBuffer(buf, hormones, desires)
  │   └─ 写入激素水平 → SENSE[0..3]
  │   └─ 写入欲望水平 → THINK[0..4]
  ├─ selectAction()
  │   └─ getStrongest() → 按 satisfies 过滤动作 → 随机选择
  └─ 返回 { hormones, desires, currentAction }

applyFeedback(action)
  ├─ desires.satisfy(type) → intensity *= (1 - decayRate)
  └─ hormones.applyEffect(hormoneEffects) → 加上增量
```

## 文件布局

```
src/
  types.ts          — 类型定义和枚举
  event-bus.ts      — 优先级发布/订阅 (~95 行)
  buffer.ts         — StateBuffer 读写 (~70 行)
  hormone.ts        — 4 种激素振荡器 (~50 行)
  desire.ts         — 5 种欲望 + 5 个动作 (~110 行)
  body.ts           — 整合激素+欲望 (~75 行)
  tick-runner.ts    — Tick 循环 (~70 行)
  create-myelix.ts  — 装配工厂 (~17 行)
  demo.ts           — 60-tick 可运行演示 (~130 行)
```

## 缺失的部分

相比完整的认知架构，Myelix 省略了:

- **评估** — 无法判断结果好坏
- **世界模型** — 没有环境的内部表示
- **元认知** — 没有自我反思或策略切换
- **记忆** — 没有当前 tick 之外的持久存储
- **规划** — 没有前瞻或目标选择
- **外部输入处理** — 没有传感器，无法使用 LLM 输出
