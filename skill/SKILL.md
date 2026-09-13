---
name: calctool
description: '按需生成确定性计算引擎与在线计算工具工程合同：支持显式 engineId、自定义指标和受控公式 AST。Excel 映射与图片 OCR 当前仅有声明式 Profile，执行器尚未接入；不得把声明当作已完成导入。Use for deterministic calculator engines with an explicit engineId and controlled formula AST. Excel/OCR execution is planned and not installed.'
---

# calctool

Package version: v7.0.39

把「业务计算逻辑」编译为「可执行的在线计算工具」的生成器。

## 全链路总流程（老板视角 → 可运行工具）

```
老板（任何 IDE / DSH）："我要搭电商运营计算工具"
  ↓
1. 顾问式对话（intake-round）   —— 智能体主动给方案（基于领域参考包），
   老板逐轮确认指标/公式/口径，直到说"创建"
  ↓
2. 情报蜂群（research）        —— 自动派情报智能体搜索行业标准/抓指定地址，
   产出可溯源参考包（老板说"电商"等关键词时自动触发）
  ↓
3. 蜂群编排（swarm-orchestrate）—— 需求自动拆解为 fields/formulas/rules/
   imports/reports/pages 项目 JSON，交给 swarm 大脑编排：企业组织架构派单 →
   认领 → 执行 → 回传 → 红绿灯监控 → 固定运维（心跳/回收/接替/继承）
   → 安全守卫（注入检测），确定性合并
  ↓
4. 编译工具（compile-tool）    —— 引擎定义 → 可运行工程文件清单
   （App 壳/公式引擎/存储/构建，页面自动生成：录入/指标卡/报告）
  ↓
5. 环境适配（probe-env/adapt-config）—— 输出 Node/包管理器/OS/架构的声明性配置；
   当前平台模板只在 Node≥18 + better-sqlite3 路径闭环，Node 16/sql.js 与 <16 预览执行器未安装
  ↓
6. 完成前门禁（final-gate）      —— 审计/测试/运维三智能体协调接管检测，
   全部符合通过（engine-valid / 基准样例全通过 / 环境就绪）才标记完成
  ↓
7. 交付运行                     —— 按适配命令一键搭建（pnpm install → pnpm run dev）
   → 老板得到可交互工具；后续对话继续改指标/公式（热更新）

或直接走「全自动流水线」（auto-pipeline）——老板只需说需求 + 授权一次：
  授权(告知消耗) → 情报蜂群 → 蜂群生成 → 测试审计 → 编译 → 自动启动弹出页面
  → 完成前门禁（审计/测试/运维三智能体协调接管，全部符合通过才标记完成）
  全程无需老板参与，热更新即时生效
```

**关键**：老板一句话 → 对话确认 → 情报 → 蜂群 → 编译 → 环境适配 → **可运行工具**。全程框架不变，需求变更只改配置。

## 何时使用

- 用户描述了一个领域场景（财务、运营、工程、教育、医疗……）并想要一个可交互的在线计算工具
- 用户已有指标、公式、评分或报告逻辑，想固化成工具
- 用户需要"自定义指标 + 自定义公式 + 上传识别"能力

不要用于：纯展示型页面（无计算）、与计算无关的 CRUD 后台。

## Official catalog hops

After `capabilities`, read `officialCatalog`. Default allowlist is official skills. Call another skill only when its capability matches this demand. User-named extras enter only when the user names them; then confirm that skill's capabilities before invoke. Do not call chain-unrelated or self-extended skills.

## 核心原则

1. **确定性计算**：正式数字由版本化确定性引擎（公式 AST + Decimal 运行时）产生；模型/OCR/AI 只产生候选、草稿与解释，绝不直接给出不可追溯的正式结果。
2. **配置化而非代码化**：工具 = 一份可发布的引擎定义（字段目录 + 公式图 + 规则包 + 导入映射 + 视图 + 报告），不是散落的页面代码。
3. **显式除零**：所有除法必须选 `div`（除零报错）或 `safeDivide`（除零回退），不静默吞错。
4. **零虚构**：能力未接入时保持"未接入态"（planned/not_installed/disconnected），不虚构数据、状态或按钮。

## 能力状态（源码事实）

| 编号 | 状态 | 当前边界 |
|------|------|----------|
| C1 engineId | implemented | `compile-inline`、`compile-tool` 与蜂群计划要求调用方显式传入合法 engineId；缺失或格式错误直接阻断，禁止从需求文本自动截取。 |
| C2 final-gate 求值 | local-runner-required | 远端 `final-gate` 固定返回 `incomplete + local-runner-required`，绝不返回可被误解的完成结论。本地 runner 从真实仓库读取引擎并以 BigInt coefficient + scale 的 28 位十进制定点求值；错误 expected（包括伪造 0）会阻断。 |
| C3 Excel / OCR | planned / not-installed | `inputMethod` 与 `importProfiles` 只是引擎合同；当前没有 Excel 解析器或 OCR 执行器，不得宣称已自动导入。 |
| C4 网页校验器 | planned / not-installed | 已有 `validate` API；尚无管理后台网页版粘贴校验器。 |
| C5 SQLite 历史 | partial | 仓库内平台模板已通过本地 API 读写 better-sqlite3，计算历史不再使用 localStorage；`compile-tool` 仍只返回工程文件清单，实际模板落地依赖本地执行层。 |

调用远端 `final-gate` 只能得到未完成状态。真实公式门禁必须执行 `cli-calctool final-gate <repositoryRoot> <enginePath>`；其中 Ops 项只检查本机环境探测与命令配置是否完整，**不会执行 install/run 命令**。需要命令执行证据时必须交给独立 Validator。

## 五步实施流程

### 1. intake —— 收集需求（必须提问，一次一问）
调用运行时 intake 或按下面问题逐条问用户：
- 目标：这个工具帮用户完成什么？什么必须发生、什么绝不允许发生？
- 输入指标：用户会输入哪些字段？（如收入、成本、人数、月份）
- 公式逻辑：哪些指标由公式算出？（如毛利 = 收入 - 成本）
- 输入方式：手工录入 / Excel 上传 / 图片 OCR / 三者都要？
- 输出形式：指标卡、表格、诊断报告、历史记录？
- 约束：单位、精度、语言、离线/在线、禁止项？

### 2. 生成引擎定义（Engine Definition）
```yaml
engineId: <调用方显式提供的 kebab-case 引擎名，必填>
name: <显示名>
category: <领域，如 finance/operations/education>
ownerType: platform-template
status: draft
semanticVersion: 1.0.0
compatibilityProfile: legacy-compatible
decimalPolicy: decimal-string
defaultLocale: zh-CN
```
包含（详见 references/engine-meta-model.md）：
- field-catalog：字段目录（类型：amount/ratio/int/enum/dimension/date）
- formula-graph：公式图（节点 = 字段/公式，边 = 依赖）
- rule-packs：规则包（阈值、评分、分级）
- import-profiles：导入映射（Excel 列 / OCR 字段 → 字段目录）
- report-template：报告模板（指标卡 + 表格 + 诊断结论）

### 3. 编译公式（详见 references/formula-dsl.md）
- 把自然语言/Excel 公式编译为 JSON AST（禁止 eval/new Function）
- 运算符走最小注册表（add/sub/mul/div/safeDivide/percentOf/if/case/sum/avg/lookup…）
- 数值用 Decimal 字符串，单位编译期推断，错误结构化传播
- 发布前跑依赖图检查：引用存在、无环、可见范围

### 4. 生成在线工具（详见 references/declarative-pages.md）
- 表单页：录入字段（按 field-catalog 自动生成）
- 指标卡页：公式结果 StatGrid
- 报告页：结构化输出 + 可导出
- 页面用声明式规格（ApplicationPageSpec），不手写重复模板

### 5. 验收与发布
- validate：确定性校验引擎定义（引用闭合、无环、单位一致、测试通过）
- 上传识别当前只定义导入 Profile；Excel/OCR 执行器为 `planned/not_installed`，接入前不得生成自动导入成功结论
- **完成前门禁（final-gate）**：远端仅返回 `incomplete + local-runner-required`；每次项目完成之前必须由本地 runner 读取真实引擎并执行检测——
  - **审计智能体**：引擎定义确定性校验 0 findings、公式仅走受控 AST（禁 eval）、引用闭合
  - **测试智能体**：基准样例（testSuites）全部通过，一个不过都不放行
  - **运维智能体**：只对调用方提供的环境探测、依赖分级和命令配置做声明性检查；不远程执行安装/启动命令
  - 本地审计、测试和运维配置检查全部符合才返回 gate passed；任一未通过返回 findings，修复后重新检测
- 发布为版本化引擎，任何公式/字段/阈值变化都创建新版本，不原地修改
- 输出：可运行的在线工具 + 引擎定义包 + 验收报告 + 完成前门禁结论

## 多智能体蜂群模式（接入 swarm 编排，推荐复杂工具用）

单智能体 `compile-inline` 适合简单工具；复杂工具（多字段 + 多公式 + 规则 + 导入 + 报告）用**蜂群编排（swarm）**：通过智能体大脑调度创建 N 个子智能体，企业级组织架构规则 + 项目 JSON 任务派单/认领/回传 + 红绿灯 + 固定运维与安全守卫——准确率更高、产出更强、可观测可自治。

### 接入方式（swarm-orchestrate）

1. **swarm-orchestrate**：传需求 → calctool **自动拆解**为项目 JSON（需要几个派几个）：
   - `research` 情报收集（有领域关键词才派）
   - `fields` 字段目录（入口，总是有）
   - `formulas` 公式图（有公式才派）· 独立复核
   - `rules` 规则包（有规则才派）· 独立复核
   - `imports` 导入映射（有导入才派）
   - `reports` 报告模板（有报告才派）
   - `pages` 页面规格（总是有）
2. **swarm 大脑编排**：项目 JSON 交给 swarm 运行时（https://cli.tax/zj7fTPVh4p）：
   - `org-chart`：按企业组织架构创建 N 个子智能体（board/dispatcher/ops/security-guard/workers）
   - `dispatch`：依赖图驱动派单（fields 先 → formulas/imports 并行 → reports → pages）
   - `claim`：worker 认领任务；`report`：回传结果
   - `traffic-light`：每任务/智能体实时绿/黄/红状态 + 进度/错误汇报
   - `ops`：固定运维——心跳检测，卡死/死亡自动回收，派新智能体继承任务续跑
   - `security-guard`：固定安全守卫——注入/危险指令检测、异常警报
3. **确定性合并**：收集全部 worker 回传 → 合并为引擎定义 → 校验 → 发布

### 准确率与用户控制
- **准确率**：合并后引擎定义必须通过确定性校验（引用闭合/公式链/单位/Decimal/无环），0 findings 才发布
- **用户控制**：每一步产物可查看、修改、重试（budget.maxAttempts）；最终工具可测算、改公式、调阈值
- **编程能力**：蜂群产物是真实可编译的引擎定义（JSON AST + Decimal 运行时），不是伪代码

### Blueprint 协同（可选）
`brain-handshake` 时可选择 `blueprintEnabled`：生成引擎定义后，先交给 Blueprint 技能规划工具开发蓝图
（`blueprint-orchestrate` → `https://cli.tax/wvz6zmRWmX`，operation `compile-inline`），
再回到蜂群执行开发任务，验收标准全部可追溯。不开启时直接蜂群生成，全程框架一致。

## 输出产物

```
<engine-id>/
├── manifest.yaml           # 引擎身份与版本
├── field-catalog.json      # 字段目录
├── formula-graph.json      # 公式图（AST）
├── rule-packs.json         # 规则包
├── import-profiles.json    # 导入映射
├── report-template.json    # 报告模板
└── tests/                  # 确定性测试（样例 → 期望结果）
```

## 参考文档

- `references/engine-meta-model.md` —— 引擎元模型（字段/公式/规则/导入/报告）
- `references/formula-dsl.md` —— 公式 DSL 与运行时（AST/Decimal/依赖图/错误值）
- `references/declarative-pages.md` —— 声明式页面规格系统（表单/指标/报告渲染）
- `references/import-ocr.md` —— 导入与 OCR（Excel 映射/图片识别/草稿确认）
- `references/finance-example.md` —— 经营健康诊断完整范例（50 字段 → 10 指标 → 报告）

## 安全规则

- 不执行任意 JavaScript；公式只走受控 AST
- 上传文件先验证类型/大小/指纹，OCR 结果进草稿不覆盖正式数据
- 不虚构后端数据；未接入能力显示真实状态
- 财务/税务输出需明确"经营估算模型，生产使用前由专业人员复核"

## 受限调用与自动评价闭环

- IDE / 智能体必须通过本包 `invoke` 或 JSON-stdin `broker` 调用，不得直接拼装技能 HTTP 请求，也不得读取 BrainClient token。
- broker 默认读取账号共享凭据文件；显式 `CLITAX_BRAIN_CLIENT_TOKEN_FILE` 使用绝对路径覆盖；macOS/Linux 文件必须为当前 broker 账户所有且权限 `0600`，Windows 文件必须位于受限 `%LOCALAPPDATA%\CLI.Tax\broker` 目录。
- broker 只需要 Brain Client HTTPS、受限身份文件和调用方显式传入的路径，本身不需要完整磁盘访问。若要保证 IDE 无法读取身份文件，必须把 broker 放进独立低权限系统账户或沙箱服务，并只暴露受限 IPC；broker 与 IDE 同账户运行时，`0600` 不能隔离二者，禁止声称令牌已隔离。
- broker 只用 `Authorization: BrainClient …` 发起一次 runtime 请求。HTTP 成功后必须保留响应顶层原始 `feedbackReceiptId`、`feedbackInvocationId` 和 `feedbackEvaluation.digest`，不得生成、猜测、复用或跨调用转移。
- Brain Client 服务端必须严格绑定请求/响应的 `requestId` 和 `schemaVersion`，再根据真实状态、验证结果、服务端耗时与 findings 生成并持久化权威评分、评语和摘要。broker 不得生成分数或评语。
- 同一次 runtime 请求在服务端事务内生成并持久化评价，再返回 `feedbackReceiptId`、`feedbackInvocationId` 和权威摘要；broker 只验证已提交回执，不发起第二次评价写入。`not-reported`、验证不完整、P0/P1 findings、`blocked` 或 `failed` 都不得生成好评。
- 缺少凭证或 ID、身份不匹配、摘要不匹配、响应非法以及任何 HTTP 失败都必须显式失败，不得静默、不重试成重复评价。
- 本地 CLI 不提供手工评分或评语提交命令，人类不得选择技能分数或填写技能评价；日常聊天不属于评价协议。

调用示例：`npx cli-calctool@latest invoke <operation> '<JSON对象>'`。IDE 集成可向 `npx cli-calctool@latest broker` 的 stdin 发送 `{"operation":"capabilities","input":{}}`。

## 网络中断与原回执恢复

仅在 TLS 握手前确定尚未发送 HTTP 请求时，broker 才允许最多 3 次连接尝试，并受总超时约束。请求发出后发生断线或响应中断，只用 GET 查询原 requestId 的服务端回执，禁止重发 POST；未取得有效回执时保留不确定状态，不得假定成功或继续依赖步骤。

`npx cli-calctool@latest recover <operation> <requestId>` 可重新查询原调用，不会重做操作或重复计费。链恢复不会跳过人工确认，也不会自动重跑结果不确定的本地命令。代理连接需 Node.js 22.21+ 或 24.5+；不支持的运行时会明确报错。

## 执行完整性共同规则

1. 工程目标、已接受范围和验收项必须持久化；新增需求先路由与合并，不能覆盖原目标。子任务有明确服务目标的理由，执行仅用本链已匹配技能。每次恢复读取 task-resume，核对剩余项、pending请求和continuationNotifications。
2. 默认由主代理完成工作，禁止为了省事创建子代理、把简单查找/改名/少量修改/单条命令/例行检查/汇总交接给多智能体，禁止为达到门槛拆分或夸大任务。启用Aimlock或Swarm模式不是创建授权，管理/运维/安全/协调是主代理职责，不额外创建常驻智能体。只有业务确需独立且实质性的交付、主代理同时有可推进的独立工作、预期收益严格高于上下文传递/协调/验收成本时才派单；复用已有合适负责人，用户禁止委派时不得创建。每次创建前记录业务理由、交付物、验收项、主代理工作、成本收益、精确路径和原负责人；只创建当前需要的最少数量，不预建空闲角色，不递归扩编或重复扫描。规模门槛200行/3文件/跨模块仅为必要条件，不能单独证明值得委派。主代理负责整合和完整验收，不把半成品当完成；预算抱怨不是停止指令。
3. 自报、回复送达和动作完成不等于工程交付验证。reported始终待验收；Swarm接受工程任务时复用Validator校验签名、有效期、计划/产物/任务绑定。无证据、伪造runner或失败检查不得成为绿色完成。
4. 原任务交接前保存检查点并释放旧锁；回程只发持久通知，宿主消费后重新核验基线、快照与写入权限。历史恢复结果不是新授权。技能不能自行唤醒未接入的IDE。
5. 心跳停止仅允许自动回收尚未开工的assigned任务；claimed/running进入执行结果待核对状态，禁止盲目重复执行。已回传、已验收、失败和取消任务不会被自动重派。服务器停滞回收同时保存会员通知，对话界面定期读取展示。
6. 预计长任务在预算初始化后、深读前提出一次精确自动续时策略；只有真实授权才自动续时。时间、文件数、token和写入权限分别计量；额度/次数耗尽、撤销和完成必须明确停止并说明下一步。读取预算不是付费充值，计时器由宿主运行。
7. 云端沙箱开关按调用会员读取；关闭时仅允许当前受审官方源码摘要在受控worker中直接执行，并记录executionIsolation。未知或修改过的源码明确要求sandbox，不伪造隔离结果；worker直接执行不是OS沙箱。
8. 使用技能前检查官方发布版本并自动升级可管理的安装副本与客户端；配置失败或升级失败停止并报告。通过configure的JSON标准输入导入一次账号凭据，后续项目/分支/任务共享；密钥不进入源码、URL或命令参数。显式环境覆盖必须是绝对路径。网页复制在点击时获取当前凭据，页面仅展示无密钥地址；已撤销密钥没有权限自动获取新密钥，需已认证网页重新同步一次。

English: keep simple work with the main agent. Delegate only substantial independent business deliverables when benefits exceed coordination costs; use the fewest needed agents, never create idle management agents. Enabling Aimlock does not authorize delegation. Finish all authorized work; a cost complaint is not a stop request. Preserve the original goal; verify execution evidence; resume from durable checkpoints; never replay uncertain side effects. Read-time renewal requires bounded approval. Reuse account credentials and check managed skill updates before use; revoked credentials require an authenticated refresh.

Русский: сохраняйте исходную цель, проверяйте доказательства выполнения и возобновляйте работу из сохранённой точки. Не повторяйте операции с неизвестным результатом. Продление чтения требует ограниченного разрешения; ключи учётной записи используются повторно, обновления навыков проверяются перед вызовом.

## 账号共享凭据与自动更新

在已登录的能力市场复制安装入口，将内容粘贴给 IDE。页面只展示原地址，剪贴板会携带当前账号凭据。IDE 将四字段凭据 JSON 经标准输入交给 `npx cli-aimlock@latest configure`；不要放到命令参数、项目文件或日志中。一次配置供同一操作系统账号的所有项目、分支和任务使用，八个技能共享同一文件。

默认位置：macOS 为 `~/Library/Application Support/CLI.Tax/broker/credential.json`，Linux 为 `~/.local/share/CLI.Tax/broker/credential.json`，Windows 为 `%LOCALAPPDATA%\CLI.Tax\broker\credential.json`。显式 `CLITAX_BRAIN_CLIENT_TOKEN_FILE` 仍按绝对路径覆盖默认位置；迁移旧 IDE 配置时移除其过时覆盖，再使用账号共享文件。macOS/Linux 校验当前账号所有权和0600权限；Windows校验仅当前账号与SYSTEM可访问的ACL。

每次新技能调用先查询官方发布版本，精确版本下载并校验身份后自动使用；更新已托管的当前项目与账号技能目录，失败恢复旧目录，禁止覆盖 Git 跟踪源码或未托管内容。升级返回 `upgrade.reloadRequired` 和说明路径时，IDE 应读取更新后的 SKILL.md、核对本任务合同再继续。install/check同样自动更新，不需要每次人工发升级指令。查询不确定调用的原回执不升级、不重发操作。

升级不会清除账号凭据；各调用重新读取共享文件，因此重新同步一次密钥后所有任务使用新值。已撤销或失效的密钥不能为自己取得新权限，必须从已认证网页重新同步一次。两个不同操作系统账号不共享私密文件。

English: configure once using JSON stdin; all tasks under the same OS account reuse the credential. Each new invocation checks and updates the official package and managed documentation. Reload updated instructions when indicated. Revoked keys require a fresh authenticated copy.

Русский: настройте ключ один раз через JSON stdin для всех задач пользователя ОС. Перед новым вызовом пакет и управляемые инструкции обновляются автоматически. Отозванный ключ требует повторной синхронизации с авторизованной страницы.
