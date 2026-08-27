# Calctool 声明式页面产物
## `compile-tool` 输入

`compile-tool` 是本地执行层操作。它接收 `input.engine`；未提供时，可从 `input.requirements` 构建引擎。引擎校验失败时返回 `status: blocked` 和 `findings`，不生成编译结果。

## 当前页面清单

成功编译后返回三个简化的声明项：

1. `input`：`kind: form`，`fields` 为引擎字段 key 列表。
2. `dashboard`：`kind: metrics`，`metrics` 为公式 key 列表。
3. `report`：`kind: report`，当前没有更细的 section schema。

这三项是文件落地层的输入清单，不是已渲染的网页。

## 返回产物

`compile-tool` 返回：

- `status: compiled`、`engineId`、绿色 `validation`和引擎 `digest`；
- `environment`：当前探测到的 tier、包管理器、Node 主版本、OS 和架构；
- `pages`：上述三项页面清单；
- `files`：`package.json`、引擎定义、App 壳、公式求值器、依赖图、存储、Vite 配置和 README 的路径/用途清单；
- `commands`：环境适配后的 install、run 和 build 命令字符串。

## 调用方职责

运行时只返回清单和配置，不写文件、不安装依赖、不启动服务。本地 runner 必须按清单落地工程，再独立验证页面和命令。

## 当前边界

- 运行时尚无完整 `ApplicationPageSpec` JSON Schema。
- `requirements.output` 会保存在引擎中，但当前不会改变固定的三页清单。
- 报告分节、导出、历史页和可视化布局没有在此运行时实现，不得从 `kind` 字段推断它们已完成。

## 实现依据

`calctool-runtime.mjs` 的 `compile-tool` 分支是本文的权威来源。
