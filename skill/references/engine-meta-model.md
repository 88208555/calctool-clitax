# Calctool 引擎元模型
## 适用范围

当前引擎合同的 `schemaVersion` 是 `engine.spec/1`。它描述确定性计算的输入字段、公式 AST、验收样例和声明性页面/导入/报告信息；它不是任意 JavaScript 容器。

## 顶层字段

- `engineId`：调用方显式提供，匹配 `^[a-z0-9][a-z0-9._-]{0,127}$`；`compile-inline` 不会自动生成。
- `name`、`category`、`semanticVersion`、`status`：显示名、领域、语义版本和草稿/发布状态。
- `compatibilityProfile`、`decimalPolicy`、`defaultLocale`：当前构建器分别生成 `legacy-compatible`、`decimal-string`、`zh-CN`。
- `inputMethod`、`output`、`constraints`：记录输入方式、期望输出和硬约束；是合同信息，不代表对应执行器已安装。

## 集合

- `fields`：字段目录。常用项为 `key`、`label`、`type`、`unit`、`required`、`description`。
- `formulas`：公式目录。常用项为 `key`、`label`、`expression`；`expression` 是受控 JSON AST。
- `rules`、`views`、`testSuites`：规则、视图和确定性样例。当前运行时要求它们为数组，但没有为 rule/view 定义完整 item schema。
- `importProfiles`、`reports`：导入映射与报告声明。当前只保存数组，没有导入或报告执行器。

## 构建路径

### `compile-inline`

`input.requirements` 必须包含 `goal`、`engineId`、非空 `inputs` 和非空 `formulas`。成功时返回 `revision`、`validation`、`artifacts`、`engine` 和 `nextStep`。当前构建器只把 `inputs` 与 `formulas` 带入引擎，并把 `rules`、`views`、`importProfiles`、`reports`、`testSuites` 初始化为空数组。

### 蜂群合并

`mergeSwarmArtifacts` 可把调用方收集的 `fields`、`formulas`、`rules`、`views`、`importProfiles`、`reports` 和 `testSuites` 合并为引擎，并记录 `runPlanRef` 与 `swarmProduced`。

## 校验与错误

`validate` 检查信封、必需数组、字段键重复、数值字段单位、公式表达式和引用闭合。失败返回 `status: blocked` 及结构化 `findings`。当前校验不证明依赖无环、单位推导或 rule/import/report 内部结构正确；这些不得写成已实现保证。

`compile-inline` 会对最终引擎 JSON 生成 SHA-256 摘要，摘要用于识别本次产物，不代表外部签名或远端执行证明。

## 实现依据

`calctool-runtime.mjs` 的 `validateEngine`、`inspectCompileRequirements`、`buildEngine`、`mergeSwarmArtifacts` 和 `compile-inline` 分支是本文的权威来源。
