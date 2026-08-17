# calctool

**万能计算工具生成器 skill** —— 一句话需求 → 可执行、可验证、可发布的在线计算工具。

- **CLI.Tax 源**: `https://cli.tax/KKyA6xljUX`（`calctool.skill.request/1.0`）
- **多 IDE 安装器**: 检测本机已装 IDE（Codex/DSH/Claude/Cursor/…），把 skill 分发到各 IDE 用户级根
- **更新感知**: 每次 install 对比 cli.tax 最新版本并提示 ⤴；`check` 子命令主动检查

## 一键安装（npm）

```bash
npx cli-calctool@latest install
```

## 从本仓库安装

```bash
git clone https://github.com/88208555/calctool-clitax.git
cd calctool-clitax
node install.mjs install        # 自动检测本机已装 IDE 并分发
node install.mjs check          # 检查已安装 skill 是否有新版本
node install.mjs update         # 幂等覆盖更新
```

## 目录结构

```
calctool/
├── install.mjs       # 安装器（Node ≥18，零依赖）：install / check / update / pull / uninstall / list / ides
├── sources.json      # cli.tax skill 源（KKyA6xljUX）
├── package.json      # npm 包元数据（cli-calctool）
├── README.md
└── skills/calctool/
    ├── SKILL.md               # 技能定义（生成万能计算工具的完整流程）
    ├── skill.json             # 技能元数据
    ├── install-meta.json      # 版本锚点（来源/版本/时间）
    ├── references/            # 引擎元模型 / 公式 DSL / 声明式页面 / 导入 OCR / 财务范例
    ├── templates/             # 领域参考包（电商运营 10 指标 8 公式 6 基准 41 来源）
    └── platform-template/     # 可运行的 Ant Design X 平台模板（表单/指标卡/报告 + 授权 + 流水线）
```

## 与 cli-blueprint 的关系

`cli-blueprint` / `Blueprint-clitax` 是「多 skill 多 IDE 安装器」（blueprint + calctool 一起分发）；
本仓库是 **calctool 专属**入口，内容与双方共享同一份 `skills/calctool/` 事实源。
