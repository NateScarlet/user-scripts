# GLOSSARY-MAP

本仓库按站点划分上下文，每个上下文的术语表在同目录 `GLOSSARY.md`，按需创建（`/domain-modeling` 在真正定下术语时写）。

| 上下文    | 术语表                            | ADR                       |
| --------- | --------------------------------- | ------------------------- |
| bilibili.com | `src/bilibili.com/GLOSSARY.md` | `src/bilibili.com/docs/adr/` |
| ciweimao.com | `src/ciweimao.com/GLOSSARY.md` | `src/ciweimao.com/docs/adr/` |
| niconico.jp  | `src/niconico.jp/GLOSSARY.md`  | `src/niconico.jp/docs/adr/`  |
| sfacg.com    | `src/sfacg.com/GLOSSARY.md`    | `src/sfacg.com/docs/adr/`    |
| syosetu.com  | `src/syosetu.com/GLOSSARY.md`  | `src/syosetu.com/docs/adr/`  |
| x.com        | `src/x.com/GLOSSARY.md`        | `src/x.com/docs/adr/`        |

`src/utils/`、`src/types/` 是跨站点共享代码，不单独成上下文；跨站点的系统级决策放 `docs/adr/`。
