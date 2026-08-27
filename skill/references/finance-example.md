# 经营指标最小范例
## 范例性质

本文只演示当前 AST 和 `engine.spec/1` 如何组合，不是 Calctool 内置的财务模型，不提供行业阈值、税务结论或专业意见。当前运行时没有内置“50 字段 → 10 指标”领域包，不得把 intake 中的示例描述写成已交付功能。

## 可验证引擎示例

```json
{
  "schemaVersion": "engine.spec/1",
  "engineId": "finance-health-demo",
  "name": "经营指标演示",
  "category": "finance",
  "semanticVersion": "1.0.0",
  "status": "draft",
  "compatibilityProfile": "legacy-compatible",
  "decimalPolicy": "decimal-string",
  "defaultLocale": "zh-CN",
  "inputMethod": "manual",
  "output": ["metric-cards"],
  "fields": [
    { "key": "revenue", "label": "收入", "type": "money", "unit": "CNY", "required": true },
    { "key": "cost", "label": "成本", "type": "money", "unit": "CNY", "required": true }
  ],
  "formulas": [
    {
      "key": "grossProfit",
      "label": "毛利",
      "expression": { "op": "sub", "args": [{ "ref": "revenue" }, { "ref": "cost" }] }
    },
    {
      "key": "grossMarginPct",
      "label": "毛利率",
      "expression": { "op": "percentOf", "args": [{ "ref": "grossProfit" }, { "ref": "revenue" }] }
    }
  ],
  "rules": [],
  "views": [],
  "importProfiles": [],
  "reports": [],
  "testSuites": [
    {
      "name": "基本样例",
      "input": { "revenue": "100", "cost": "60" },
      "expected": { "grossProfit": "40", "grossMarginPct": "40" }
    }
  ]
}
```

## 验证流程

1. 对完整引擎调用 `validate`，确认结构和引用闭合。
2. 在本地 runner 的 `final-gate` 中执行样例。公式测试部分应得到 `grossProfit=40` 和 `grossMarginPct=40`。
3. `final-gate` 还会检查引擎审计和调用方提供的环境配置；公式样例通过不等于整体门禁必然通过。

## `compile-inline` 注意事项

`compile-inline` 要求 `goal`、显式 `engineId`、非空 `inputs` 和非空 `formulas`，但当前构建器会把 `testSuites` 初始化为空数组。因此本文使用完整 `engine.spec/1` 展示基准样例；不应声称将此 JSON 改成 `requirements` 后会自动保留测试。

## 业务边界

毛利与毛利率仅是公式演示。真实生产口径、会计分类、税项、权重、阈值和报告结论必须由用户确认并经专业人员复核，不得由模型自行补全。

## 实现依据

`calctool-runtime.mjs` 的 intake 示例、`buildEngine`、`evaluateFormulaGraph` 和 `final-gate` 是本文的权威来源。
