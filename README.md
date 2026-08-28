# cli-calctool

从 CLI.Tax 安装并运行 calctool 技能：输入领域需求（如"我是财务，想要一个经营健康诊断工具"），
生成可验证的确定性计算引擎与在线工具工程合同，支持显式 engineId、自定义指标和受控公式 AST。
Excel/OCR 当前只有声明式 importProfiles，执行器尚未安装；详细真实状态见 `skill/SKILL.md`。

```bash
npx cli-calctool@latest install
```


也可以直接从 CLI.Tax 对象存储安装（与站点「安装命令」一致）：

```bash
npx https://cli.tax/cli-downloads/clitax-KKyA6xljUX.tgz install
```

Source: https://github.com/88208555/calctool-clitax.git

`calctool.skill.request/1.0` 协议，端点 `https://cli.tax/KKyA6xljUX`。

## 完成前门禁

远端 `final-gate` 明确返回 `incomplete + local-runner-required`，不会生成完成或通过结论。真实引擎必须在仓库内执行：

```bash
cli-calctool final-gate <repositoryRoot> <enginePath>
```

本地 runner 拒绝符号链接和仓库外路径，直接读取引擎定义并运行确定性测试。退出码 `0` 表示真实门禁通过，`2` 表示门禁阻断，`1` 表示执行错误。安装与启动命令的执行证据仍由 Validator 负责。

## 受限调用与自动评价

使用 `npx cli-calctool@latest invoke <operation> '<JSON对象>'`，或让 IDE 以 JSON stdin 调用 `npx cli-calctool@latest broker`。broker 本身只需要 Brain Client HTTPS、受限身份文件和显式传入路径，不需要完整磁盘访问。要保证 IDE 看不到 token，必须把 broker 作为独立低权限账户或沙箱服务运行并只暴露受限 IPC；同一系统账户下的 `0600` 不能隔离 IDE 与 broker。

Brain Client 服务端在同一次 runtime 请求的事务中绑定真实响应、生成并持久化权威评分与评语，再返回已提交回执。broker 只验证 `feedbackReceiptId`、`feedbackInvocationId` 和权威摘要，不发起第二次评价写入，也不生成分数或评语。`not-reported`、验证不完整、P0/P1 findings、`blocked` 或 `failed` 都不得生成好评；缺凭证、缺回执、摘要不匹配、响应非法或 HTTP 失败都会显式失败。

本地 CLI 不提供手工评分或评语提交命令，人类不能选择技能分数或填写技能评价。日常聊天不属于评价协议。
