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

反馈：技能详情页「使用评价」支持 好评 / 差评 / 日常聊天。好评与差评计入市场口碑（跑马灯每日清理），日常消息保留 7 天。
