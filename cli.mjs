#!/usr/bin/env node
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dispatchOfficialSkillCli, runIntakeHandshake } from './installer.mjs'
import { runLocalFinalGate } from './calctool-local-runner.mjs'

const INTAKE_QUESTIONS = [
  {
    id: 'goal',
    prompt: 'Describe what the tool must let users do: which domain, what inputs, what outputs. What must never happen?',
    required: true,
    example: '财务经营健康诊断：输入利润表 50 个字段，输出十大指标评分与健康报告；绝不虚构后端数据。',
  },
  {
    id: 'inputs',
    prompt: 'List the user-entered fields (name, type, unit). Include any custom indicators the user wants to define.',
    required: true,
    example: '收入(money,CNY)、货品成本(money,CNY)、正式员工数(integer,人)；用户可自定义指标。',
  },
  {
    id: 'formulas',
    prompt: 'Describe the calculation logic: which derived metrics, formulas, scoring rules, or grading thresholds.',
    required: true,
    example: '运营毛利 = 收入 - 货品成本；健康分 = Σ(指标分×权重)，权重 30%/17%/15%/…；除零回退 0。',
  },
  {
    id: 'input-method',
    prompt: 'How do users get data in: manual entry, Excel upload, image/PDF OCR, or a combination?',
    required: false,
    example: 'Excel 上传 + 手工录入；Excel 原生解析，截图走 OCR 草稿确认。',
  },
  {
    id: 'output',
    prompt: 'What output forms are needed: metric cards, tables, diagnostic report, history, export?',
    required: false,
    example: '指标卡 + 诊断报告(HTML) + 历史记录。',
  },
  {
    id: 'constraints',
    prompt: 'State hard constraints: precision/rounding, language, offline/online, storage, forbidden behaviors.',
    required: false,
    example: '金额保留 2 位小数；中文界面；无账号也可用；禁止执行任意 JavaScript。',
  },
]

const command = process.argv[2] ?? 'help'
if (command === 'final-gate') {
  try {
    const result = await runLocalFinalGate({
      repositoryRoot: process.argv[3],
      enginePath: process.argv[4],
    })
    console.log(JSON.stringify(result))
    process.exitCode = result.status === 'complete' ? 0 : 2
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
} else {
  await dispatchOfficialSkillCli({
    packageRoot: dirname(fileURLToPath(import.meta.url)),
    extraUsageLines: [
      'Trusted local completion gate:',
      '  cli-calctool final-gate <repositoryRoot> <enginePath>',
    ],
    runCommand: (context) => runIntakeHandshake(context, {
      questions: INTAKE_QUESTIONS,
      outputFile: 'CALCTOOL-REQUIREMENTS.json',
      afterCapabilities(output) {
        const instruction = output.nextStep?.instruction
        if (typeof instruction === 'string' && instruction.trim()) console.log(instruction)
      },
    }),
  })
}
