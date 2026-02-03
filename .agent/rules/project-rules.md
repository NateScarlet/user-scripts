---
trigger: always_on
---

- 禁止 `as any`
- 禁止定义全局 css 类
- 禁止使用自定义 HTML 属性，内部状态应该由内部管理而不是暴露给公共 DOM
- 用 `pnpm check` 检查错误，不要直接 tsc（不支持 svelte)
- 发布平台审查要求不允许最小化或混淆代码
