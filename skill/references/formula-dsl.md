# Calctool 公式 DSL
## AST 节点

公式只接受 JSON 节点，不执行 `eval`、`Function` 或主机 JavaScript。

- 引用：`{ "ref": "fieldOrFormulaKey" }`
- 字面量：`{ "lit": "12.34" }`
- 运算：`{ "op": "add", "args": [...] }`

被引用字段缺失、为 `null` 或空字符串时抛出 `MISSING_INPUT`。未知运算符抛出 `Unsupported operator`。

## 已实现运算符

| `op` | 语义 |
|---|---|
| `add` | 对 `args` 求和 |
| `sub` | 第一个参数减第二个参数 |
| `mul` | 对 `args` 求积 |
| `div` | 除法；除数为零抛出 `DIV_ZERO` |
| `safeDivide` | 除数为零时返回 `0`，否则执行除法 |
| `percentOf` | 第一个参数 ÷ 第二个参数 × 100；没有除零回退 |
| `round` | 将第一个参数四舍五入到 2 位小数 |
| `if` | 第一个参数非零时求值第二个，否则求值第三个 |

`case`、`sum`、`avg`、`lookup` 当前未在运行时实现，不得放入可用运算符清单。

## Decimal 规则

运行时用 BigInt coefficient + scale 表示十进制字符串，最多保留 28 位小数。输入接受带可选正负号的普通十进制形式，不接受 `NaN`、无穷值或科学计数法。运算结果以规范化字符串返回，避免通过 JavaScript `Number` 比较丢失精度。

## 公式图与测试

`evaluateFormulaGraph` 先递归求值公式对其他公式的引用，再把结果写入本次纯计算上下文。`final-gate` 读取 `testSuites[].input|inputs` 和 `expected|expect`，对公式结果做 Decimal 精确比较。无可运行样例、计算错误或期望值不匹配都会阻断门禁。

## 当前边界

- 依赖图求值器当前没有显式的“正在访问”集合，因此不得声称已做循环依赖证明。
- 编译校验会检查表达式存在与引用闭合，但未在编译期枚举拒绝所有未支持 `op`。
- 非对象节点当前会求值为 `0`；调用方必须提交完整 AST，不应依赖该行为。

## 实现依据

`calctool-runtime.mjs` 的 `DecimalStr`、`evaluateFormula`、`evaluateFormulaGraph` 和 `final-gate` 测试智能体是本文的权威来源。
