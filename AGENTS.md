# user-scripts

按站点组织的浏览器用户脚本集合（Greasemonkey / Tampermonkey），站点脚本位于 `src/<站点域名>/`。

## Agent skills

### Issue tracker

GitHub Issues（`NateScarlet/user-scripts`，用 `gh` CLI 操作）；外部 PR 也作为请求进入 triage 队列。见 `docs/agents/issue-tracker.md`。

### Triage labels

五个状态标签沿用规范名：`needs-triage` / `needs-info` / `ready-for-agent` / `ready-for-human` / `wontfix`。见 `docs/agents/triage-labels.md`。

### Domain docs

多上下文（multi-context）：每个站点一个上下文，术语表与 ADR 分别位于 `src/<站点>/GLOSSARY.md`、`src/<站点>/docs/adr/`；根 `GLOSSARY-MAP.md` 是索引。见 `docs/agents/domain.md`。

## 项目规则

- 禁止 `as any`
- 禁止定义全局 css 类
- 禁止使用自定义 HTML 属性，内部状态应该由内部管理而不是暴露给公共 DOM
- 用 `pnpm check` 检查错误，不要直接 tsc（不支持 svelte）
- 发布平台审查要求不允许最小化或混淆代码
- 用 `void` 来建立依赖，而不是 `const _ = `
