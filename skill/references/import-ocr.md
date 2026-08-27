# Calctool 导入与 OCR 边界
## 当前能力状态

Excel 和 OCR 当前是 `planned / not-installed`。Calctool 可记录导入方式和映射 Profile，但没有 Excel 解析器、OCR 执行器、文件上传处理或草稿确认流程。

## 合同输入

`capabilities` 对 `compile-inline` 声明的 `inputMethod` 枚举为：

- `manual`
- `excel`
- `ocr`
- `excel+ocr`

引擎可含 `importProfiles` 数组。当前校验只检查它是数组，没有定义 Profile item 的列名、置信度、类型转换或错误行 schema，因此不应自行发明字段并宣称已受运行时验证。

## 两条产物路径

- `compile-inline` 会记录 `inputMethod`，但当前生成空 `importProfiles`。
- 蜂群分解在需求命中 Excel/OCR/upload/导入/上传/识别时添加 `imports` 任务。该任务的目标是定义“Excel/OCR → 字段”映射，不会在 Calctool 运行时执行识别。

## 未来执行器的最小验收点

以后接入导入执行器时，至少应独立定义并验证：可接受文件类型/大小、字段映射、类型转换错误、OCR 原始结果与置信度、人工确认后才入正式数据、执行证据和失败回滚。这些是接入要求，不是当前已实现功能。

## 错误与安全边界

当前运行时不读上传文件，因此也不会返回解析或 OCR 错误。调用方不得把 `inputMethod` 或非空 `importProfiles` 当作导入成功证据，不得生成伪造的识别结果或成功状态。

## 实现依据

`calctool-runtime.mjs` 的 intake 问题、`validateEngine`、`decomposeRequirementsToRunPlan`、`buildEngine` 和 `mergeSwarmArtifacts` 是本文的权威来源。
