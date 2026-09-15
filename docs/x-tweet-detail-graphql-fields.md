# X/Twitter 网页端 `TweetDetail` GraphQL 响应字段结构（实证调研）

调研日期：2026-09-15
目的：为「编写油猴脚本 hook 网络请求以捕获 `TweetDetail` 响应」提供事实依据。

**方法说明**：所有结论均来自可验证的一手证据——真实抓取的响应样本、开源项目解析代码、X 官方 API 文档。凡未能找到证据的条目，明确标注「未找到可靠证据」。

---

## 0. 最重要的三个结论（先读这个）

### 0.1 ⚠️ 网页端 X 走 **XHR**，不是 `fetch`

这直接决定「hook `window.fetch`」的方案能否生效。三个独立项目都选择 hook `XMLHttpRequest`：

| 项目 | 做法 |
|---|---|
| [twitter-web-exporter](https://github.com/prinsss/twitter-web-exporter)（2.7k★，同类浏览器扩展） | `globalObject.XMLHttpRequest.prototype.open = function (method, url) {...}` |
| [TwitterMediaHarvest](https://github.com/EltonChou/TwitterMediaHarvest) | 用 `Proxy` 包裹 `XMLHttpRequest.prototype.open` |
| [OldTweetDeck](https://github.com/dimdenGD/OldTweetDeck) | `XMLHttpRequest = function () {...}` 整体包装 |

源码位置：
- <https://github.com/prinsss/twitter-web-exporter/blob/main/src/core/extensions/manager.ts>（第 109-141 行 `installHttpHooks`）
- <https://github.com/EltonChou/TwitterMediaHarvest/blob/main/src/injections/injectFetch.ts>（文件名虽叫 injectFetch，实际 hook 的是 XHR）
- <https://github.com/dimdenGD/OldTweetDeck/blob/main/src/interception.js>（第 2736-2737 行）

**建议：同时 hook `XMLHttpRequest` 和 `window.fetch`。** 只 hook `fetch` 有捕获不到的风险。若只做一个，做 XHR。

另外该扩展要求在 **page 上下文**注入（而非 content 上下文），它通过检测 `webpackChunk_twitter_responsive_web` 是否存在来校验；油猴脚本需用 `unsafeWindow` 并配 `@grant none` 或对应注入模式。参见 <https://violentmonkey.github.io/posts/inject-into-context/>。

### 0.2 `media_key` 是稳定唯一标识符 —— 可直接用，无需从 URL 派生

见第 3 节。这是本次调研最关键的确认。

### 0.3 `legacy` 正在被拆解，必须**同时**兼容新旧两套路径

推文对象的 `legacy.created_at` 目前仍然存在；但**用户对象**的 `legacy.screen_name` / `legacy.name` 已被搬到 `core`，旧字段在新响应中为空。见第 1、6 节。

---

## 1. 发布时间字段

### 1.1 完整路径

**`TweetDetail` 的路径不是 `data.tweetResult.result.legacy.created_at`**。`tweetResult` 是 `TweetResultByRestId` 的形状。两者不同：

| 接口 | 到推文对象的路径 |
|---|---|
| `TweetDetail` | `data.threaded_conversation_with_injections_v2.instructions[]` → 见下 |
| `TweetResultByRestId` | `data.tweetResult.result` |

`TweetDetail` 内，主推文（focal tweet）位于 `TimelineAddEntries` 指令的 `entries[]` 中：

```
data.threaded_conversation_with_injections_v2.instructions[]
  └─ [type === "TimelineAddEntries"].entries[]
       └─ entryId 以 "tweet-" 开头的那一条
            └─ .content.itemContent.tweet_results.result
                 ├─ .legacy.created_at      ← 发布时间在这里
                 └─ .core.user_results.result
```

会话楼中楼（`entryId` 以 `conversationthread-` 开头）路径多一层：

```
.content.items[].item.itemContent.tweet_results.result
```

**实测证据**（真实 `TweetDetail` 响应 fixture，2025-04）：
<https://github.com/EltonChou/TwitterMediaHarvest/blob/main/src/libs/XApi/parsers/test-data/TweetDetail.json>

该文件为 `threaded_conversation_with_injections_v2` 节点的内容，`instructions[0].entries[0]` 即：
- `entryId` = `"tweet-1915351258162250129"`
- `content.itemContent.tweet_results.result.__typename` = `"Tweet"`
- `content.itemContent.tweet_results.result.legacy.created_at` = `"Thu Apr 24 10:25:00 +0000 2025"`

解析代码佐证（三条独立实现路径完全一致）：
- gallery-dl：`tweet = item["tweet_results"]["result"]` → `legacy["created_at"]`
  <https://github.com/mikf/gallery-dl/blob/master/gallery_dl/extractor/twitter.py>（`_pagination_tweets`，约第 2246 行）
- snscrape：`tweet = result['legacy']` → `tweet['created_at']`
  <https://github.com/JustAnotherArchivist/snscrape/blob/master/snscrape/modules/twitter.py>（`_graphql_timeline_tweet_item_result_to_tweet`，第 1510 行）
- twitter-web-exporter：类型定义为 `legacy: { created_at: string; ... }`
  <https://github.com/prinsss/twitter-web-exporter/blob/main/src/types/tweet.ts>（第 100-136 行）

### 1.2 格式：Twitter 传统格式，**不是** ISO8601

格式为 `"%a %b %d %H:%M:%S %z %Y"`，例如：

```
Thu Apr 24 10:25:00 +0000 2025
```

**实测样本值**（全部来自真实响应，非构造）：

| 样本 | 值 |
|---|---|
| TweetDetail fixture（2025-04-24） | `Thu Apr 24 10:25:00 +0000 2025` |
| 2026-01 推文样本 | `Mon Jan 19 17:02:39 +0000 2026` |
| trekhleb 文章中的实例 | `Tue Dec 10 17:41:28 +0000 2024` |
| 用户注册时间（新格式 `user.core.created_at`） | `Sat Mar 10 00:26:24 +0000 2018` |

即你猜测的 `"Wed Oct 10 20:19:24 +0000 2018"` 形态**完全正确**。trekhleb 的 TypeScript 类型定义也标注为 `created_at: string; // 'Tue Dec 10 17:41:28 +0000 2024'`，来源 <https://trekhleb.dev/blog/2024/api-design-x-home-timeline/>。

解析方式（两项目一致）：
- gallery-dl：`dt.parse(legacy["created_at"], "%a %b %d %H:%M:%S %z %Y")`
- snscrape：`email.utils.parsedate_to_datetime(tweet['created_at'])`

⚠️ **时区**：字符串中的 `+0000` 表示 UTC。JS 里 `new Date("Thu Apr 24 10:25:00 +0000 2025")` 可被现代浏览器正确解析（TwitterMediaHarvest 就是这么用的，见 `parser-tweet.ts` 第 59 行 `createdAt: new Date(tweetResult.legacy.created_at)`），但格式非标准 ISO8601，跨引擎解析有历史坑，建议自写解析或直接用该字符串做原样存储。

### 1.3 关于 `core` / `legacy` 分层

**推文对象本身**：`core` 层级目前**只有** `user_results`，**不含** `created_at`。实测 2026-01 样本中推文对象的 `core` 键为：

```
core: { user_results: {...} }     ← 仅此一个键
```

所以推文发布时间**仍**读 `result.legacy.created_at`。

**用户对象**才是被拆分的那个（见第 6 节）：`user.core.created_at` 是**用户注册时间**，不是推文发布时间，别读错。

---

## 2. 媒体字段

### 2.1 位置

```
...result.legacy.extended_entities.media[]
```

**确认成立。** 实测：2026-01 的 77 条真实推文样本中，70 条含媒体，**全部**位于 `legacy.extended_entities.media`。

### 2.2 ⚠️ 必须用 `extended_entities`，不要用 `entities`

`legacy.entities.media` 也存在，但它是**截断的**。实测一条 4 图推文：

| 字段 | 元素个数 |
|---|---|
| `legacy.entities.media` | **1** |
| `legacy.extended_entities.media` | **4** |

样本：<https://github.com/HistoryAtState/twitter/blob/main/import/986300394887438336.json>

X 官方企业版文档也明确说明：
> "Since the media type metadata in the `extended_entities` section correctly indicates the media type ('photo', 'video' or 'animated_gif'), and supports up to 4 photos, it is the preferred metadata source for native media."

来源：<https://docs.x.com/x-api/enterprise-gnip-2.0/fundamentals/data-dictionary>

twitter-web-exporter 的注释同样指出这一点：
> `// Prefer 'extended_entities' over 'entities' for media list.`

<https://github.com/prinsss/twitter-web-exporter/blob/main/src/utils/api.ts>（`extractTweetMedia`，第 271-282 行）

### 2.3 media 对象的键

实测键集合（来自 2026-01 真实样本的 video 对象 + 2025-04 TweetDetail 的 photo 对象）：

**每个 media 对象必有的键：**

| 键 | 类型 | 说明 |
|---|---|---|
| `id_str` | string | 纯数字媒体 ID，如 `"1915351241234014213"` |
| `media_key` | string | 带类型前缀的 ID，如 `"3_1915351241234014213"` |
| `media_url_https` | string | 图片/缩略图 URL |
| `type` | string | `"photo"` \| `"video"` \| `"animated_gif"` |
| `url` | string | t.co 短链 |
| `display_url` | string | 展示用短链（新版为 `pic.x.com/...`） |
| `expanded_url` | string | 展开链接，指向推文 `/photo/1` 或 `/video/1` |
| `indices` | number[2] | 在正文中的位置区间 |
| `sizes` | object | `large` / `medium` / `small` / `thumb`，各含 `w` / `h` / `resize` |
| `original_info` | object | `width` / `height` / `focus_rects` |
| `media_results` | object | `{ result: { media_key: "..." } }` |

**常有的键：**

| 键 | 说明 |
|---|---|
| `ext_alt_text` | 无障碍替代文本，**可能缺失**（未设置时该键直接不存在） |
| `ext_media_availability` | `{ status: "Available" \| "Unavailable" }`，删除/受限时用 |
| `features` | `{ large/medium/small/orig: { faces: [] } }` —— 键名即合法的 `name=` 取值 |
| `video_info` | 仅 video/animated_gif：`{ aspect_ratio, duration_millis, variants[] }` |
| `allow_download_status` | `{ allow_download: bool }` |
| `additional_media_info` | 视频附加信息（`title` / `description` / `monetizable`） |
| `source_status_id_str` / `source_user_id_str` | 仅转载他人媒体时出现 |

类型定义参考（完整、且与实测一致）：
<https://github.com/prinsss/twitter-web-exporter/blob/main/src/types/tweet.ts>（`interface Media`，第 185-239 行）

---

## 3. 【最关键】media 的稳定唯一标识符

### 3.1 结论：**有，且可直接用。用 `media_key`。**

每个 media 对象都带 **`media_key`** 字段，格式为 `<类型前缀>_<数字 ID>`：

```
media_key  = "3_1915351241234014213"      （photo）
media_key  = "13_1772955333687648256"     （video，amplify）
media_key  = "7_2014393938984022016"      （video，ext_tw_video）
media_key  = "13_1263145212760805376"     （X 官方文档示例）
```

**`media_key` 的后缀 == 同对象的 `id_str`**（实测 70/70 条完全相等）。所以两者等价：
- `media.id_str` = `"1915351241234014213"`（纯数字）
- `media.media_key` = `"3_1915351241234014213"`（带前缀）

**另有第三处冗余副本**：`media.media_results.result.media_key`，实测同样恒等于 `media.media_key`（70/70）。

### 3.2 实测证据

**真实 `TweetDetail` 响应片段**（2025-04-24，photo 类型）：
<https://github.com/EltonChou/TwitterMediaHarvest/blob/main/src/libs/XApi/parsers/test-data/TweetDetail.json>

```json
{
  "display_url": "pic.x.com/JHWgG68RHe",
  "expanded_url": "https://x.com/Nanata0418/status/1915351258162250129/photo/1",
  "id_str": "1915351241234014213",
  "indices": [6, 29],
  "media_key": "3_1915351241234014213",
  "media_url_https": "https://pbs.twimg.com/media/GpSxzlHbYAUBbsv.jpg",
  "type": "photo",
  "url": "https://t.co/JHWgG68RHe",
  "media_results": { "result": { "media_key": "3_1915351241234014213" } }
}
```

**2026-01 真实样本统计**（77 条推文 / 70 个 media 对象）：

| 检查项 | 结果 |
|---|---|
| media 对象总数 | 70 |
| 缺失 `media_key` 的 | **0** |
| `media_key` 后缀 ≠ `id_str` 的 | **0** |
| `media_results.result.media_key` ≠ `media_key` 的 | **0** |
| photo 类型的前缀 | 全部 `3_` |
| video 类型的前缀 | `13_`（48 个）或 `7_`（19 个） |

样本来源：<https://github.com/AFP-Medialab/verification-plugin/blob/master/data-test/zeeschuimer-export-twitter.com-2026-01-23T160038.ndjson>（ndjson，含 `source_url` 指向 `/i/api/graphql/.../HomeTimeline` 的真实响应体）

### 3.3 官方文档佐证

X 官方 API 文档明确定义 `media_key` 为媒体的唯一标识：

> **media_key** (default) string — Unique identifier of the expanded media content.
> `"media_key": "13_1263145212760805376"`

> `"attachments": {"media_keys": ["3_1136048009270239232"]}`

来源：<https://docs.x.com/x-api/fundamentals/data-dictionary>

### 3.4 对「能否用 X 自己的 id」的直接回答

**可以，且推荐用 `media_key`**，理由：

1. **稳定**：官方定义为唯一标识符；跨请求、跨会话不变。
2. **现成**：无需从 URL 派生。从 `media_url_https` 派生文件名（如 `GpSxzlHbYAUBbsv`）虽然也是 ID，但视频的 `media_url_https` 指向的是缩略图（`amplify_video_thumb/...` / `ext_tw_video_thumb/...`），与图片路径形态不同，派生逻辑更脆。
3. **有先例**：twitter-web-exporter 正是用 `media_key` 做媒体定位：
   ```ts
   export function getMediaIndex(tweet: Tweet, media: Media): number {
     const key = media.media_key;
     return extractTweetMedia(tweet).findIndex((value) => value.media_key === key);
   }
   ```
   <https://github.com/prinsss/twitter-web-exporter/blob/main/src/utils/api.ts>（第 377-380 行）

**唯一提醒**：`media_key` 前缀（`3_`/`7_`/`13_`/`16_`）语义未在官方文档中说明，**未找到可靠证据**解释前缀含义（推测与上传管线有关）。因此比较/去重时建议用**完整 `media_key`** 原样做键，不要只取后缀也不要自己推断前缀。同一媒体的前缀在不同响应中是否恒定，**未找到可靠证据**——稳妥做法是以 `id_str`（纯数字，无前缀）作为最终去重键，`media_key` 作为显示/匹配用。

---

## 4. 原图 URL

### 4.1 字段

```
media.media_url_https
```

实测值形如：
```
https://pbs.twimg.com/media/GpSxzlHbYAUBbsv.jpg
https://pbs.twimg.com/media/DbAJ--xWAAEy3oa.jpg
```

注意：该 URL **默认返回的不是原图**，而是某种压缩尺寸。取原图需改写查询参数。

### 4.2 取原图：改写为 `?format=<ext>&name=orig`

把 `.jpg` 后缀改写为查询参数（这是 pbs.twimg.com 的新式 URL 形态）：

```
https://pbs.twimg.com/media/GpSxzlHbYAUBbsv.jpg
  ↓
https://pbs.twimg.com/media/GpSxzlHbYAUBbsv?format=jpg&name=orig
```

两个独立项目实现完全一致：

- gallery-dl：
  ```python
  url = media["media_url_https"]
  if url[-4] == ".":
      base, _, fmt = url.rpartition(".")
      base = f"{base}?format={fmt}&name="
  else:
      base = url.rpartition("=")[0] + "="
  ```
  <https://github.com/mikf/gallery-dl/blob/master/gallery_dl/extractor/twitter.py>（`_extract_media`）

- twitter-web-exporter：
  ```ts
  export function formatTwitterImage(
    imgUrl: string,
    name: 'thumb' | 'small' | 'medium' | 'large' | 'orig' = 'medium',
  ): string {
    const regex = /^(https?:\/\/pbs\.twimg\.com\/media\/.+)\.(\w+)$/;
    const match = imgUrl.match(regex);
    if (!match) return `${imgUrl}?name=${name}`;
    const [, url, ext] = match;
    return `${url}?format=${ext}&name=${name}`;
  }
  ```
  <https://github.com/prinsss/twitter-web-exporter/blob/main/src/utils/api.ts>（第 405-418 行）

  即：取原图直接调用 `getMediaOriginalUrl(media)` → `formatTwitterImage(media.media_url_https, 'orig')`。

### 4.3 `name=` 的合法取值

**已确认的取值**（gallery-dl 配置文档明确列出）：

| 取值 | 来源 |
|---|---|
| `orig` | gallery-dl 文档 |
| `large` | gallery-dl 文档 |
| `medium` | gallery-dl 文档 |
| `small` | gallery-dl 文档 |
| `4096x4096` | gallery-dl 文档 |
| `900x900` | gallery-dl 文档 |
| `360x360` | gallery-dl 文档 |
| `thumb` | twitter-web-exporter 类型定义 |

gallery-dl 默认值：`["orig", "4096x4096", "large", "medium", "small"]`（前者为主，后者为 fallback）

来源：<https://github.com/mikf/gallery-dl/blob/master/docs/configuration.rst>（`extractor.twitter.size` 段）

**响应内自带的佐证**：`media.features` 的键名恰好是 `large` / `medium` / `small` / `orig`（实测），与合法取值对应：

```json
"features": {
  "large":  { "faces": [] },
  "medium": { "faces": [] },
  "small":  { "faces": [] },
  "orig":   { "faces": [] }
}
```

trekhleb 文章中的类型定义独立印证了同一组键：
```ts
features: { large: {faces: ...}; medium: {...}; small: {...}; orig: {...}; };
sizes:    { large: MediaSize; medium: MediaSize; small: MediaSize; thumb: MediaSize; };
```
来源：<https://trekhleb.dev/blog/2024/api-design-x-home-timeline/>

**注意**：`media.sizes` 的键是 `large` / `medium` / `small` / `thumb` —— 有 `thumb` 而**无** `orig`；`features` 则有 `orig`。两者用途不同，别混用。

### 4.4 ⚠️ 视频/动图的「原图」不是这么取的

- **视频原文件**：从 `media.video_info.variants[]` 取 `content_type == "video/mp4"` 中 `bitrate` 最大的一条的 `url`（指向 `video.twimg.com`）。
  ```ts
  protected getResultFromBody ...
  // twitter-web-exporter:
  return maxBitrateVariant?.url ?? media.media_url_https;
  ```
- **视频缩略图**：`media_url_https` 指向 `amplify_video_thumb/...` 或 `ext_tw_video_thumb/...`，此类端点**不支持** `?format=&name=`，需改用路径后缀 `:orig`：
  ```ts
  // Thumbnail endpoint is not supporting format and name query parameters
  if (this.isThumbnail) {
    url.pathname += ':' + variant;
    return url.href;
  }
  ```
  <https://github.com/EltonChou/TwitterMediaHarvest/blob/main/src/domain/valueObjects/tweetMedia.ts>（`getVariantUrl`，第 32-50 行）

实测视频缩略图 URL 示例：
```
https://pbs.twimg.com/amplify_video_thumb/1884741354942521344/img/...
https://pbs.twimg.com/ext_tw_video_thumb/2014393938984022016/pu/img/...
```

---

## 5. 多图时的顺序

### 5.1 结论

- **数组顺序即展示顺序**，且该顺序在同一次响应内是确定的。
- **不存在独立的下标字段**可用于交叉校验。
- 跨响应识别「同一张图」应依赖 `media_key` / `id_str`，**不要**依赖数组下标。

### 5.2 `indices` 无法区分同推文的多张图（实测）

一条含 4 张图的真实推文（<https://github.com/HistoryAtState/twitter/blob/main/import/986300394887438336.json>）：

| 数组下标 | `indices` | `media_url_https` |
|---|---|---|
| 0 | `167,190` | `.../DbAJ--xWAAEy3oa.jpg` |
| 1 | `167,190` | `.../DbAKA2dXkAApGk_.jpg` |
| 2 | `167,190` | `.../DbAKCMlXcAAvMM9.jpg` |
| 3 | `167,190` | `.../DbAKE5HXUAA0L3J.jpg` |

**四张图的 `indices` 完全相同**——因为在正文里它们同属一个 t.co 链接位置。所以 `indices` 只能告诉你「媒体出现在正文哪个位置」，**不能**区分多图之间的先后。

同样不可靠的是 `expanded_url`：上例中四张图的 `expanded_url` **全部**是 `.../photo/1`（并非 `photo/1`..`photo/4`）。⚠️ 网上常见"用 expanded_url 的 /photo/N 判断序号"的说法，在此样本中**不成立**。现代响应中该字段是否逐图递增，**未找到可靠证据**。

### 5.3 各项目的处理方式

- **gallery-dl**：直接按数组顺序编号 `for tdata["num"], file in enumerate(files, 1)`，没有做任何排序或校验。
- **twitter-web-exporter**：以 `media_key` 在数组中的 `findIndex` 作为序号：
  ```ts
  index: { description: 'The media index in tweet (start from 0)',
           extractor: (tweet, media) => String(getMediaIndex(tweet, media)) },
  num:   { description: 'The order of media in tweet (1/2/3/4)',
           extractor: (tweet, media) => String(getMediaIndex(tweet, media) + 1) },
  ```
  <https://github.com/prinsss/twitter-web-exporter/blob/main/src/utils/media.ts>
  其 `num` 的文档字符串「The order of media in tweet (1/2/3/4)」正说明 X 单推最多 4 张图。

- **TwitterMediaHarvest**：也按数组顺序递增 `index`（`parseMedias` 中 `index: imageIndex` / `videoIndex`），但对图片和视频**分别**编号。

### 5.4 实践建议

1. 用数组下标做「展示序号」。
2. 用 `media_key`（或 `id_str`）做「稳定身份」，用于去重与跨会话匹配。
3. 同推文多图上限为 4（X 平台限制，非响应约束）。

---

## 6. 作者信息

### 6.1 路径（新格式，当前有效）

```
...result.core.user_results.result.core.screen_name    ← @handle
...result.core.user_results.result.core.name           ← 昵称
...result.core.user_results.result.rest_id             ← 数字用户 ID
...result.legacy.user_id_str                           ← 同一用户 ID（legacy 侧冗余）
```

### 6.2 ⚠️ `core.user_results.result.legacy.screen_name` 已失效

实测 2026-01 真实样本中，用户对象的 `legacy` 已被掏空——`screen_name`、`name`、`created_at` **全部为空**：

| 路径 | 实测值 |
|---|---|
| `user.core.screen_name` | `"hootsuite"` ✅ |
| `user.core.name` | `"Hootsuite 🦉"` ✅ |
| `user.legacy.screen_name` | **空** ❌ |
| `user.legacy.name` | **空** ❌ |
| `user.legacy.created_at` | **空** ❌ |

该样本的 `user.legacy` 只剩这些键（**已无身份字段**）：
```
default_profile, default_profile_image, description, entities, fast_followers_count,
favourites_count, followers_count, friends_count, has_custom_timelines, is_translator,
listed_count, media_count, normal_followers_count, pinned_tweet_ids_str, possibly_sensitive,
profile_banner_url, profile_interstitial_type, statuses_count, translator_type, url,
want_retweets, withheld_in_countries
```

同一现象在 TweetDetail fixture 中复现：`user.legacy.screen_name` 为空，`user.core.screen_name` = `"Nanata0418"`。

### 6.3 必须双路径兼容

twitter-web-exporter 的源码里有一条明确注释：

```ts
/*
| Since the `legacy` object was removed we need to support both the new and old formats.
*/
```

其 `extractTweetUserScreenName` 用可选链兼容新格式：
```ts
export function extractTweetUserScreenName(tweet: Tweet): string {
  return tweet.core?.user_results?.result?.core?.screen_name ?? '';
}
```
而 `User` 的其他字段仍走 legacy（如 `user.legacy?.followers_count`）。
<https://github.com/prinsss/twitter-web-exporter/blob/main/src/utils/api.ts>（第 305-358 行）

TwitterMediaHarvest 则在运行时探测两种形状：
```ts
const user = new TweetUser({
  ...(isUser(userResult)
    ? { displayName: userResult.core.name, screenName: userResult.core.screen_name, ... }
    : { displayName: userResult.legacy.name, screenName: userResult.legacy.screen_name, ... }),
});
```
<https://github.com/EltonChou/TwitterMediaHarvest/blob/main/src/libs/XApi/parsers/tweet.ts>（第 40-56 行）

**建议读取顺序**：
```js
const screenName = u.core?.screen_name ?? u.legacy?.screen_name;
const name       = u.core?.name        ?? u.legacy?.name;
const userId     = u.rest_id           ?? u.legacy?.id_str;
```

### 6.4 gallery-dl 的对应实现（参考）

```python
def _transform_user(self, user):
    uid = user.get("rest_id") or user["id_str"]
    if "core" in user:
        core = user["core"]
        legacy = user["legacy"]
    else:
        core = legacy = user          # 旧结构：core 与 legacy 合体
    ...
    "name": core.get("screen_name"),
    "nick": core.get("name"),
```
<https://github.com/mikf/gallery-dl/blob/master/gallery_dl/extractor/twitter.py>

---

## 7. 接口变体与触发场景

### 7.1 变体清单

| 操作名 | 响应根路径 | 用途 |
|---|---|---|
| `TweetDetail` | `data.threaded_conversation_with_injections_v2.instructions[]` | 推文详情页 + 会话楼 |
| `TweetResultByRestId` | `data.tweetResult.result` | 单条推文，无会话 |
| `TweetResultsByRestIds` | 批量 | 一次取多条 |
| `ModeratedTimeline` | `data.tweet.result.timeline_response.timeline.instructions[]` | 受限推文的详情视图 |

**触发场景（据现有证据）**：

- **`TweetDetail`**：打开推文详情页、需要展示回复/会话上下文时。其变量含 `focalTweetId`、`referrer`、`rankingMode`。
  gallery-dl 的 `referrer` 取 `"profile"`：<https://github.com/mikf/gallery-dl/blob/master/gallery_dl/extractor/twitter.py>（`tweet_detail`，第 1488-1510 行）
- **`TweetResultByRestId`**：只需单条推文、不含会话时。gallery-dl 在**未登录**（无 `x-twitter-auth-type`）时走这个；登录后默认走 `TweetDetail`：
  ```python
  endpoint = self.config("tweet-endpoint")
  if endpoint == "detail" or endpoint in {None, "auto"} and \
          self.api.headers["x-twitter-auth-type"]:
      return self._tweets_detail(self.tweet_id)
  return self._tweets_single(self.tweet_id)
  ```
  <https://github.com/prinsss/twitter-web-exporter/blob/main/src/modules/tweet-detail/api.ts> 中该扩展**同时**监听 `TweetDetail` 与 `ModeratedTimeline` 两个操作。
- **`TweetResultsByRestIds`**：FxEmbed 标注 `requiresAccount: true`，`TweetResultByRestId` 标注 `requiresAccount: false`。
  <https://github.com/FxEmbed/FxEmbed/blob/main/packages/atmosphere/src/providers/twitter/graphql/queries.ts>（第 143-201 行）

**「直接访问推文页 vs 客户端路由跳转」是否走不同接口 —— 未找到可靠证据。** 现有资料未能区分这两种导航方式分别触发哪个操作。稳妥做法是**同时监听三个操作名**，与前人实现保持一致。

### 7.2 ⚠️ queryId 频繁轮换，绝不能硬编码

同一操作名在不同时间/不同项目中的 queryId 完全不同：

| 操作 | queryId（来源） |
|---|---|
| `TweetDetail` | `iFEr5AcP121Og4wx9Yqo3w`（gallery-dl） |
| `TweetDetail` | `R9IzzyzQBV87-DOWpcvDmw`（FxEmbed） |
| `TweetDetail` | `FyR-GrebyjdkRoW1z6uCgQ`（fa0311 内部 API 文档） |
| `TweetDetail` | `8sK2MBRZY9z-fgmdNpR3LA`（twitter-web-exporter 注释） |
| `TweetResultByRestId` | `qxWQxcMLiTPcavz9Qy5hwQ`（gallery-dl） |
| `TweetResultByRestId` | `2ICDjqPd81tulZcYrtpTuQ`（yt-dlp） |
| `TweetResultByRestId` | `snmujSvB_9WXyd8yjvZ24Q`（fa0311） |
| `TweetResultByRestId` | `f2sagi1jweVHFkTUIHzmMQ`（FxEmbed） |
| `TweetResultByRestId` | `2Acdg-VztGlHX7MjX67Ysw`（TwitterMediaHarvest） |
| `TweetResultsByRestIds` | `B3F9uRHu_kwtjyEnZNyVAg`（FxEmbed） |
| `TweetResultsByRestIds` | `VwY22EyG-lO-eT6Myg_F0A`（fa0311） |

**正确做法：按操作名正则匹配 URL，忽略 queryId。**

twitter-web-exporter：
```ts
const isTweetDetail = /\/graphql\/.+\/TweetDetail/.test(req.url);
```

TwitterMediaHarvest：
```ts
const Pattern = Object.freeze({
  tweetRelated:
    /^(?:\/i\/api)?\/graphql\/(?<queryId>.+)?\/(?<queryName>TweetDetail|TweetResultByRestId|UserTweets|UserMedia|HomeTimeline|HomeLatestTimeline|UserTweetsAndReplies|UserHighlightsTweets|UserArticlesTweets|Bookmarks|Likes|CommunitiesExploreTimeline|ListLatestTweetsTimeline|SearchTimeline)$/,
  ...
})
```
<https://github.com/EltonChou/TwitterMediaHarvest/blob/main/src/injections/injectFetch.ts>

---

## 8. SSR 与客户端路由

### 8.1 有状态内嵌，但是 `window.__INITIAL_STATE__`，且**不含推文内容**

X 网页端确实在初始 HTML 中内嵌状态，位于内联 `<script nonce="...">` 标签中的 **JS 赋值**：

```html
<script nonce="...">
window.__INITIAL_STATE__ = {"optimist":[...],"featureSwitch":{...}};
window.__META_DATA__ = {"env":"prod","isFromDynamicRenderer":false,...};
</script>
```

- 是 **`window.__INITIAL_STATE__`**，**不是** `__NEXT_DATA__`，**不是** `window.__reactRouterContext`，**不是** `<script type="application/json">`。
- 是 **JS 赋值语句**，不是纯 JSON（含 `undefined` 等 JS 字面量），需 JS 感知的解析器。

**证据**：
- 真实存档 HTML：<https://github.com/yuxi-liu-wired/cyc-archive/blob/main/websites/twitter.com/20201109025312/cyc_ai/index.html>
  （本地核验：43,058 字节；7 个 `<script>` 标签；含 `__INITIAL_STATE__` 与 `__META_DATA__`；**不含** `__NEXT_DATA__`；不含 `full_text`）
- fa0311 项目的提取代码直接匹配字面量 `"window.__INITIAL_STATE__="`：
  <https://github.com/fa0311/TwitterInternalAPIDocument/blob/master/generator.py>
- 该项目**每日自动再生**的状态快照（结构为 React-Query 风格 store）：
  <https://github.com/fa0311/TwitterInternalAPIDocument/blob/master/docs/json/InitialState.json>
  （本地核验：抓取于 2026-09-15，最新提交 2026-09-15T00:15:04Z；顶层键为 `optimist` / `entities` / `featureSwitch` / `settings` / `devices` / `session` / `developer` / `snoozedTags`，其中 `entities.tweets` 为 `{entities, errors, fetchStatus}`）

> ⚠️ **证据强度说明**：上述存档 HTML 样本是 **2020-11-09** 的，用于证明「机制存在」足够，但**不足以证明 2026 年的具体形状**。不过 `window.__INITIAL_STATE__` 这一机制延续至今有旁证：fa0311 的快照至今仍每日成功提取该变量，且其顶层结构（`entities.tweets` 为 React-Query 表）与 2020 样本一致。

**关键：内嵌状态里的推文表是空的。** 同一份存档 HTML 中：

```json
"tweets": { "entities": {}, "errors": {}, "fetchStatus": {} }
```

且 43KB 的 HTML 中**完全不含** `full_text` 子串。也就是说：

> **初始 HTML 中不包含推文正文，推文内容是客户端渲染的。**

佐证：
- <https://stackoverflow.com/questions/62526483/twitter-website-doesnt-have-open-graph-tags>
- <https://github.com/yt-dlp/yt-dlp/issues/17105>（HTML 只给出 bundle 与 queryId，正文来自 GraphQL）

### 8.2 对「客户端路由不产生新请求」判断的影响

**该判断不成立 —— 客户端路由进入推文页会发出新的请求。**

最强证据是 `TweetDetail` 的请求变量里带 `referrer` 字段，其值记录**从哪个路由跳转而来**：

```
GET https://x.com/i/api/graphql/{query-id}/TweetDetail
    ?variables={"focalTweetId":"...","referrer":"home","controller_data":"DACABBSQ","rankingMode":"Relevance",...}
```

来源：<https://trekhleb.dev/blog/2024/api-design-x-home-timeline/>
（该文明确描述："the user clicks on the tweet and the `GET` request to the following endpoint is performed"）

`referrer: "home"` 是一个**每次导航才有意义**的值——若结果来自缓存重放，该字段无存在意义。gallery-dl 中对应位置传 `"referrer": "profile"`。

同时该文指出首页时间线**不会**预取会话，点进推文才触发 `TweetDetail`。

**对油猴脚本的含义**：客户端路由进入推文页**会**产生可捕获的 XHR，hook 方案可行。但：

- 由于第 8.1 节的原因，**不能**指望从初始 HTML 里直接读推文数据——Safari/首次整页加载时同样会发 XHR（只是时机在 JS 启动后）。
- ⚠️ **重复访问同一推文是否命中缓存而不发请求 —— 未找到可靠证据。** 所有已观察到的数据都显示会发请求，但「没观察到」不等于「不存在」。建议脚本对同一 `TweetDetail` 响应做幂等处理，不要假设一定收到。

---

## 9. 附：完整字段路径速查

以 `TweetDetail` 主推文为例：

```
data.threaded_conversation_with_injections_v2.instructions[]
  [type === "TimelineAddEntries"].entries[]
    [entryId 以 "tweet-" 开头]
      .content.itemContent.tweet_results.result          ← 推文对象（tweet_results 可能无 result）
        .__typename                                      "Tweet" | "TweetWithVisibilityResults"
                                                          | "TweetTombstone" | "TweetUnavailable"
        .rest_id                                         推文数字 ID
        .legacy.created_at                               ★ 发布时间 "Thu Apr 24 10:25:00 +0000 2025"
        .legacy.id_str                                   推文数字 ID
        .legacy.full_text                                正文（长推文可能截断，见 note_tweet）
        .legacy.extended_entities.media[]                ★ 媒体数组
          .media_key                                     ★★ 稳定媒体 ID "3_1915351241234014213"
          .id_str                                        媒体数字 ID "1915351241234014213"
          .media_url_https                               ★ 图片 URL
          .type                                          "photo" | "video" | "animated_gif"
          .original_info.{width,height}
          .ext_alt_text                                  替代文本（可能缺失）
          .video_info.variants[]                         视频流（仅 video/gif）
          .media_results.result.media_key                与上方 media_key 相同
        .legacy.entities.media[]                         ⚠️ 截断版，勿用
        .core.user_results.result                        ★ 作者对象
          .__typename                                    "User"
          .rest_id                                       作者数字 ID
          .core.screen_name                              ★ @handle
          .core.name                                     ★ 昵称
          .core.created_at                               作者注册时间（注意：非推文时间）
          .legacy.screen_name                            ⚠️ 新响应中为空
          .legacy.name                                   ⚠️ 新响应中为空
        .note_tweet.note_tweet_results.result.text       长推文正文（若存在，优先于 full_text）
        .quoted_status_result.result                     引用的推文（结构同上）
        .legacy.retweeted_status_result.result           转推的原推文（结构同上）
        .views.count                                     浏览量

  [type === "TimelineAddToModule"].moduleItems[]
    .item.itemContent.tweet_results.result               懒加载的会话回复

  [entryId 以 "conversationthread-" 开头的 entry]
    .content.items[].item.itemContent.tweet_results.result   楼中楼
```

**`TweetResultByRestId` 的差异**：根路径是 `data.tweetResult.result`，其余字段形状一致。

**`__typename` 分支处理**（务必实现，否则遇到受限推文会崩）：

| `__typename` | 处理 |
|---|---|
| `Tweet` | 直接用 |
| `TweetWithVisibilityResults` | 真实对象在 `.tweet` 下一层 |
| `TweetTombstone` | 推文已删除/受保护，`.tombstone.text.text` 为原因文案 |
| `TweetUnavailable` | 不可用，`.reason` 形如 `NsfwLoggedOut` / `Protected` |
| `tweet_results.result` 不存在 | 可见性受限，跳过 |

参考实现：
<https://github.com/prinsss/twitter-web-exporter/blob/main/src/utils/api.ts>（`extractTweetUnion`，第 221-249 行）
<https://github.com/JustAnotherArchivist/snscrape/blob/master/snscrape/modules/twitter.py>（第 1496-1509 行）
<https://github.com/yt-dlp/yt-dlp/blob/master/yt_dlp/extractor/twitter.py>（`_graphql_to_legacy`，第 1077-1120 行）

---

## 10. 未找到可靠证据的条目（明确列出）

1. **`media_key` 类型前缀（`3_`/`7_`/`13_`/`16_`）的确切语义** —— 无官方说明。前缀取值与 `type` 有相关性（photo→`3_`，video→`7_`/`13_`），但同一媒体的前缀是否绝对恒定未经证实。建议用 `id_str` 做最终去重键。
2. **直接访问推文页 vs 客户端路由跳转分别触发哪个具体操作**（`TweetDetail` vs `TweetResultByRestId`）—— 无法从现有资料区分。建议同时监听全部三个操作名。
3. **重复访问同一推文在同一 SPA 会话内是否命中缓存而不发请求** —— 未找到证据。
4. **crawler User-Agent（如 Twitterbot）是否获得服务端渲染的推文正文 HTML** —— 存在无法证实的搜索片段，未找到可靠一手证据。对普通浏览器 UA，「初始 HTML 无正文」的结论成立。
5. **现代响应中 `expanded_url` 的 `/photo/N` 是否逐图递增** —— 2018 样本中 4 张图全部为 `/photo/1`，该说法在此样本中不成立。
6. **`legacy` 被拆解的确切时间线与最终形态** —— 仅能确认「2026-01 时用户对象的 `legacy` 身份字段已空」，推文对象的 `legacy.created_at` 仍有效。未来可能继续迁移，代码应对两条路径都做兼容。

---

## 11. 主要证据来源汇总

**真实响应样本（一手）**
- TweetDetail 真实响应 fixture（2025-04，含 photo）：<https://github.com/EltonChou/TwitterMediaHarvest/blob/main/src/libs/XApi/parsers/test-data/TweetDetail.json>
- HomeTimeline 真实响应样本，77 条 / 70 个 media（2026-01）：<https://github.com/AFP-Medialab/verification-plugin/blob/master/data-test/zeeschuimer-export-twitter.com-2026-01-23T160038.ndjson>
- 4 图推文（v1.1 格式，用于对照）：<https://github.com/HistoryAtState/twitter/blob/main/import/986300394887438336.json>

**官方文档**
- X API 数据字典（`media_key`、`created_at` ISO8601 说明）：<https://docs.x.com/x-api/fundamentals/data-dictionary>
- X 企业版数据字典（`extended_entities` 优先说明）：<https://docs.x.com/x-api/enterprise-gnip-2.0/fundamentals/data-dictionary>

**开源项目源码**
- gallery-dl：<https://github.com/mikf/gallery-dl/blob/master/gallery_dl/extractor/twitter.py> ／ 配置文档 <https://github.com/mikf/gallery-dl/blob/master/docs/configuration.rst>
- snscrape：<https://github.com/JustAnotherArchivist/snscrape/blob/master/snscrape/modules/twitter.py>
- yt-dlp：<https://github.com/yt-dlp/yt-dlp/blob/master/yt_dlp/extractor/twitter.py>
- twitter-web-exporter（**最贴近本需求的同类实现**）：<https://github.com/prinsss/twitter-web-exporter>
- TwitterMediaHarvest：<https://github.com/EltonChou/TwitterMediaHarvest>
- nitter：<https://github.com/zedeus/nitter/blob/master/src/parser.nim>
- FxEmbed（GraphQL 操作定义）：<https://github.com/FxEmbed/FxEmbed/blob/main/packages/atmosphere/src/providers/twitter/graphql/queries.ts>
- fa0311/TwitterInternalAPIDocument（逆向内部 API 文档）：<https://github.com/fa0311/TwitterInternalAPIDocument/blob/master/docs/markdown/GraphQL.md>

**技术文章**
- X 首页时间线 API 设计（含 `TweetDetail` 触发描述）：<https://trekhleb.dev/blog/2024/api-design-x-home-timeline/>

---

## 附：同目录相关文件

- [`x-tweet-detail-ssr-report.md`](./x-tweet-detail-ssr-report.md) —— 第 8 节 SSR 专题的扩展证据集，含 `__INITIAL_STATE__` 原始 HTML 片段、`generator.py` 提取代码、以及更多第三方佐证。
