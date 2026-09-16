// 纯逻辑模块（无副作用），供脚本与测试共同使用。
// 不依赖 DOM/浏览器全局，保持可移植、可单测。

// #region 常量

/** 匹配 GraphQL 推文详情请求 URL，捕获操作名。queryId 会轮换，只能按操作名匹配。 */
export const TWEET_GRAPHQL_OPERATION_PATTERN =
  /\/graphql\/.+?\/(TweetDetail|TweetResultByRestId)(?:[?&]|$)/;

/** 匹配推文详情页路径：/i/status/<id> 短链、/<user>/status/<id>，含子路径与查询串 */
export const TWEET_STATUS_PATTERN =
  /^\/(?:i\/status\/(\d+)|[^/]+\/status\/(\d+))(?:\/.*)?$/;

// "Thu Apr 24 10:25:00 +0000 2025"，非标准 ISO8601，自写解析避免跨引擎差异
const TWITTER_DATE_PATTERN =
  /^[A-Za-z]{3} ([A-Za-z]{3}) (\d{2}) (\d{2}):(\d{2}):(\d{2}) ([+-]\d{4}) (\d{4})$/;

const MONTH_INDEX = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
} as const;

const MAX_QUOTED_DEPTH = 3;

// #endregion

// #region 类型与类型守卫

export interface Author {
  name: string;
  screenName: string;
}

export interface MediaItem {
  mediaKey: string;
  /** 原图 / 视频封面原图 URL */
  url: string;
  type: string;
  altText?: string;
  /** 原图尺寸（original_info），用于分片检测与拼接布局 */
  width?: number;
  height?: number;
  /**
   * t.co 短链（display_url）。真实多图推文的多张图也会共享同一短链
   * （2014 起 Twitter 让多图只占一个短链），因此分片判定必须叠加尺寸一致性。
   */
  displayUrl?: string;
  /** t.co 短链（GraphQL url 字段），出现在 full_text 中对应媒体的位置 */
  tcoUrl?: string;
  /** 在 full_text 中的位置区间 [start, end)（Rune offset） */
  indices?: [number, number];
}

export interface ImageEntry {
  /** 原图 URL。分片拼合图没有对应的源图 URL，省略该字段以免下游解析者误抓 */
  url?: string;
  data?: string;
}

export function isPlainObject(
  value: unknown
): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

// #endregion

// #region 推文提取

export function matchTweetId(pathname: string): string | undefined {
  const match = TWEET_STATUS_PATTERN.exec(pathname);
  return match?.[1] ?? match?.[2];
}

/**
 * 从响应中提取当前推文。__typename 可能是 Tweet、TweetWithVisibilityResults
 * （真实对象在其 .tweet 下一层）、TweetTombstone（已删除）、TweetUnavailable
 * （受限），且可能不存在——逐一处理，遇到受限推文时返回 undefined 而非中断。
 */
export function normalizeTweetResult(
  result: unknown
): Record<string, unknown> | undefined {
  if (!isPlainObject(result)) {
    return undefined;
  }
  if (result.__typename === 'Tweet') {
    return result;
  }
  if (result.__typename === 'TweetWithVisibilityResults') {
    return isPlainObject(result.tweet) ? result.tweet : undefined;
  }
  return undefined;
}

export function tweetIdOf(
  tweetResult: Record<string, unknown>
): string | undefined {
  const restId = asString(tweetResult.rest_id);
  if (restId !== undefined) {
    return restId;
  }
  const legacy = tweetResult.legacy;
  return isPlainObject(legacy) ? asString(legacy.id_str) : undefined;
}

export function findTweetResult(
  data: unknown,
  operation: string,
  expectedTweetId: string,
  log: (...args: unknown[]) => void = () => undefined
): Record<string, unknown> | undefined {
  const root = isPlainObject(data) ? data.data : undefined;
  if (!isPlainObject(root)) {
    log('响应中没有 data 节点');
    return undefined;
  }
  if (operation === 'TweetDetail') {
    // 推文数据在 instructions 中按 TimelineAddEntries 提取
    const conversation = root.threaded_conversation_with_injections_v2;
    if (!isPlainObject(conversation)) {
      log('响应中没有 threaded_conversation_with_injections_v2 节点');
      return undefined;
    }
    const instructions = conversation.instructions;
    if (!Array.isArray(instructions)) {
      log('响应中 instructions 缺失');
      return undefined;
    }
    for (const instruction of instructions) {
      if (
        !isPlainObject(instruction) ||
        instruction.type !== 'TimelineAddEntries'
      ) {
        continue;
      }
      const entries = instruction.entries;
      if (!Array.isArray(entries)) {
        continue;
      }
      for (const entry of entries) {
        if (!isPlainObject(entry)) {
          continue;
        }
        const entryId = asString(entry.entryId);
        if (entryId === undefined || !entryId.startsWith('tweet-')) {
          continue;
        }
        const itemContent = isPlainObject(entry.content)
          ? entry.content.itemContent
          : undefined;
        const tweetResults = isPlainObject(itemContent)
          ? itemContent.tweet_results
          : undefined;
        const tweetResult = isPlainObject(tweetResults)
          ? normalizeTweetResult(tweetResults.result)
          : undefined;
        if (
          tweetResult !== undefined &&
          tweetIdOf(tweetResult) === expectedTweetId
        ) {
          return tweetResult;
        }
        log(
          'TimelineAddEntries 中推文条目不匹配',
          entryId,
          `等待=${expectedTweetId}`
        );
      }
    }
    log('TimelineAddEntries 中未找到目标推文', expectedTweetId);
    return undefined;
  }
  // TweetResultByRestId
  const tweetResult = root.tweetResult;
  if (!isPlainObject(tweetResult)) {
    log('响应中没有 tweetResult 节点');
    return undefined;
  }
  const normalized = normalizeTweetResult(tweetResult.result);
  if (normalized === undefined || tweetIdOf(normalized) !== expectedTweetId) {
    log('TweetResultByRestId 不匹配目标推文', expectedTweetId);
    return undefined;
  }
  return normalized;
}

// #endregion

// #region 推文数据提取

/** 作者、正文、时间分属新旧两种结构（legacy 正在被拆解），双路径兼容 */
export function extractAuthor(
  tweetResult: Record<string, unknown>
): Author | undefined {
  const core = tweetResult.core;
  if (!isPlainObject(core)) {
    return undefined;
  }
  const userResults = core.user_results;
  if (!isPlainObject(userResults)) {
    return undefined;
  }
  const user = userResults.result;
  if (!isPlainObject(user)) {
    return undefined;
  }
  const userCore = isPlainObject(user.core) ? user.core : undefined;
  const userLegacy = isPlainObject(user.legacy) ? user.legacy : undefined;
  const name = asString(userCore?.name) ?? asString(userLegacy?.name) ?? '';
  const screenName =
    asString(userCore?.screen_name) ?? asString(userLegacy?.screen_name) ?? '';
  if (name === '' && screenName === '') {
    return undefined;
  }
  return { name, screenName };
}

export function tweetText(tweetResult: Record<string, unknown>): string {
  // 长推文正文优先（note_tweet），其次 legacy.full_text
  const noteTweet = tweetResult.note_tweet;
  if (isPlainObject(noteTweet)) {
    const noteTweetResults = noteTweet.note_tweet_results;
    if (isPlainObject(noteTweetResults)) {
      const noteResult = noteTweetResults.result;
      if (isPlainObject(noteResult)) {
        const noteText = asString(noteResult.text);
        if (noteText !== undefined) {
          return noteText;
        }
      }
    }
  }
  const legacy = tweetResult.legacy;
  return isPlainObject(legacy) ? (asString(legacy.full_text) ?? '') : '';
}

export interface TweetTranslation {
  /** 翻译文本 */
  translation: string;
  /** 源语言代码，如 ko */
  sourceLanguage: string;
  /** 目标语言代码，如 zh */
  destinationLanguage: string;
}

/** X 自带翻译（grok_translated_post_with_availability） */
export function tweetTranslation(
  tweetResult: Record<string, unknown>
): TweetTranslation | undefined {
  const grok = tweetResult.grok_translated_post_with_availability;
  if (!isPlainObject(grok) || grok.is_available !== true) {
    return undefined;
  }
  const data = grok.data;
  if (!isPlainObject(data)) {
    return undefined;
  }
  const translation = asString(data.translation);
  if (translation === undefined) {
    return undefined;
  }
  return {
    translation,
    sourceLanguage: asString(data.source_language) ?? '',
    destinationLanguage: asString(data.destination_language) ?? '',
  };
}

export function parseTwitterDate(input: string | undefined): Date | undefined {
  if (input === undefined) {
    return undefined;
  }
  const match = TWITTER_DATE_PATTERN.exec(input);
  if (match !== null) {
    const month = MONTH_INDEX[match[1] as keyof typeof MONTH_INDEX];
    if (month !== undefined) {
      const tz = match[6];
      const tzOffsetMinutes =
        (parseInt(tz.slice(1, 3), 10) * 60 + parseInt(tz.slice(3), 10)) *
        (tz[0] === '-' ? -1 : 1);
      return new Date(
        Date.UTC(
          parseInt(match[7], 10),
          month,
          parseInt(match[2], 10),
          parseInt(match[3], 10),
          parseInt(match[4], 10) - tzOffsetMinutes,
          parseInt(match[5], 10)
        )
      );
    }
  }
  const fallback = new Date(input);
  return Number.isNaN(fallback.getTime()) ? undefined : fallback;
}

export function tweetCreatedAt(
  tweetResult: Record<string, unknown>
): Date | undefined {
  const legacy = tweetResult.legacy;
  return isPlainObject(legacy)
    ? parseTwitterDate(asString(legacy.created_at))
    : undefined;
}

export function quotedTweetResult(
  tweetResult: Record<string, unknown>
): Record<string, unknown> | undefined {
  const quotedStatusResult = tweetResult.quoted_status_result;
  return isPlainObject(quotedStatusResult)
    ? normalizeTweetResult(quotedStatusResult.result)
    : undefined;
}

/** 媒体取 legacy.extended_entities.media，不是 entities.media（多图时后者被截断） */
export function extractMedia(
  tweetResult: Record<string, unknown>
): MediaItem[] {
  const legacy = tweetResult.legacy;
  if (!isPlainObject(legacy)) {
    return [];
  }
  const extendedEntities = legacy.extended_entities;
  if (!isPlainObject(extendedEntities)) {
    return [];
  }
  const media = extendedEntities.media;
  if (!Array.isArray(media)) {
    return [];
  }
  const result: MediaItem[] = [];
  for (const item of media) {
    if (!isPlainObject(item)) {
      continue;
    }
    const mediaKey = asString(item.media_key);
    const mediaUrlHttps = asString(item.media_url_https);
    if (mediaKey === undefined || mediaUrlHttps === undefined) {
      continue;
    }
    const type = asString(item.type) ?? 'photo';
    const originalInfo = isPlainObject(item.original_info)
      ? item.original_info
      : undefined;
    const width =
      typeof originalInfo?.width === 'number' ? originalInfo.width : undefined;
    const height =
      typeof originalInfo?.height === 'number'
        ? originalInfo.height
        : undefined;
    result.push({
      mediaKey,
      url: originalMediaURL(mediaUrlHttps, type),
      type,
      altText: asString(item.ext_alt_text),
      width,
      height,
      displayUrl: asString(item.display_url),
      tcoUrl: asString(item.url),
      indices: Array.isArray(item.indices) &&
        typeof item.indices[0] === 'number' &&
        typeof item.indices[1] === 'number'
        ? [item.indices[0], item.indices[1]]
        : undefined,
    });
  }
  return result;
}

/**
 * 检测「同一图片被切成多张分片」的媒体组。
 * 判定条件：共享同一 display_url、尺寸一致（允许 ±1px 偏差），
 * 且成员在媒体数组中**连续**（分片必然相邻排列，索引不相连的不成组）。
 */
export function groupSlicedMedia(items: MediaItem[]): MediaItem[][] {
  const groups: MediaItem[][] = [];
  let current: MediaItem[] = [];
  for (const item of items) {
    const canJoin =
      current.length > 0 &&
      item.displayUrl !== undefined &&
      item.width !== undefined &&
      item.height !== undefined &&
      item.displayUrl === current[0]!.displayUrl &&
      Math.abs((current[0]!.width ?? 0) - item.width) <= 1 &&
      Math.abs((current[0]!.height ?? 0) - item.height) <= 1;
    if (canJoin) {
      current.push(item);
    } else {
      if (current.length >= 2) {
        groups.push(current);
      }
      current = [item];
    }
  }
  if (current.length >= 2) {
    groups.push(current);
  }
  return groups;
}

export interface PanoramaLayout {
  width: number;
  height: number;
  /** 拼接方向：竖幅分片横向拼接，横幅分片纵向拼接 */
  direction: 'horizontal' | 'vertical';
  places: { x: number; y: number; width: number; height: number }[];
}

/**
 * 计算分片拼接布局：竖幅（高≥宽）分片横向拼接还原宽图，横幅分片纵向拼接还原长图。
 * 依赖 groupSlicedMedia 保证组内尺寸一致。
 */
export function panoramaLayout(group: MediaItem[]): PanoramaLayout | undefined {
  const first = group[0];
  if (
    first === undefined ||
    first.width === undefined ||
    first.height === undefined
  ) {
    return undefined;
  }
  const horizontal = first.height >= first.width;
  let width = 0;
  let height = 0;
  const places: PanoramaLayout['places'] = [];
  for (const item of group) {
    const w = item.width ?? first.width;
    const h = item.height ?? first.height;
    places.push(
      horizontal
        ? { x: width, y: 0, width: w, height: h }
        : { x: 0, y: height, width: w, height: h }
    );
    if (horizontal) {
      width += w;
      height = Math.max(height, h);
    } else {
      height += h;
      width = Math.max(width, w);
    }
  }
  return {
    width,
    height,
    direction: horizontal ? 'horizontal' : 'vertical',
    places,
  };
}

/**
 * 两组等尺寸 RGBA 像素的每通道平均绝对差（0-255 标度，忽略 alpha）。
 * 用于比较相邻分片在切割线两侧的像素是否连续。
 */
export function meanAbsChannelDiff(
  a: Uint8ClampedArray,
  b: Uint8ClampedArray
): number {
  if (a.length !== b.length || a.length === 0) {
    return Infinity;
  }
  let sum = 0;
  const channels = (a.length / 4) * 3;
  for (let i = 0; i < a.length; i += 4) {
    sum += Math.abs(a[i] - b[i]);
    sum += Math.abs(a[i + 1] - b[i + 1]);
    sum += Math.abs(a[i + 2] - b[i + 2]);
  }
  return sum / channels;
}

/** 跨片边缘差异允许为片内基线差异的倍数 */
const EDGE_CONTINUITY_FACTOR = 2;
/** 绝对容差，吸收独立 JPEG 压缩等造成的微小差异 */
const EDGE_CONTINUITY_EPSILON = 8;

/**
 * 判定相邻分片边缘是否连续（原图在切割线处无切缝）。
 * between：跨片邻接列（行）的平均通道差；within：片内相邻列（行）的平均通道差基线。
 * 真实分片切割线两侧来自同一张图的相邻列，差异接近片内基线；无关图片则远大于基线。
 */
export function isEdgeContinuous(between: number, within: number): boolean {
  return (
    Number.isFinite(between) &&
    Number.isFinite(within) &&
    between <= within * EDGE_CONTINUITY_FACTOR + EDGE_CONTINUITY_EPSILON
  );
}

export function originalMediaURL(mediaUrl: string, type: string): string {
  if (type === 'photo') {
    // 原图档：把 .jpg 后缀改写为 ?format=<ext>&name=orig
    const match = /^(https?:\/\/pbs\.twimg\.com\/media\/.+)\.(\w+)$/.exec(
      mediaUrl
    );
    if (match === null) {
      return `${mediaUrl}?name=orig`;
    }
    return `${match[1]}?format=${match[2]}&name=orig`;
  }
  // 视频/GIF 封面缩略图端点不支持 ?format=&name=，改用路径后缀 :orig
  const thumbnailURL = new URL(mediaUrl);
  thumbnailURL.pathname += ':orig';
  return thumbnailURL.href;
}

/** 递归收集主推文与引用推文的媒体（引用推文作为嵌套记录） */
export function collectMediaItems(
  tweetResult: Record<string, unknown>,
  depth = 0
): MediaItem[] {
  const items = extractMedia(tweetResult);
  if (depth < MAX_QUOTED_DEPTH) {
    const quoted = quotedTweetResult(tweetResult);
    if (quoted !== undefined) {
      items.push(...collectMediaItems(quoted, depth + 1));
    }
  }
  return items;
}

// #endregion

// #region HTML 产物生成

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

export function formatUTCDate(date: Date): string {
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(
    date.getUTCDate()
  )}`;
}

export function formatDateTime(date: Date): string {
  return `${formatUTCDate(date)} ${pad2(date.getUTCHours())}:${pad2(
    date.getUTCMinutes()
  )} UTC`;
}

export function escapeHTMLText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderText(text: string): string {
  return escapeHTMLText(text).replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" rel="nofollow">$1</a>'
  );
}

/**
 * 从正文移除媒体 t.co 链接。Twitter 网站将这些链接渲染为图片/视频卡片，
 * 不显示为文本。同推文的多张媒体共享同一 t.co 链接，只需移除一次。
 * 移除后折叠多余空白。
 */
export function removeMediaLinks(text: string, media: MediaItem[]): string {
  if (media.length === 0 || text === '') {
    return text;
  }
  const seen = new Set<string>();
  for (const m of media) {
    if (m.tcoUrl === undefined || seen.has(m.tcoUrl)) {
      continue;
    }
    seen.add(m.tcoUrl);
    text = text.split(m.tcoUrl).join('');
  }
  return text.replace(/\s+/g, ' ').trim();
}

export function tweetURL(tweetResult: Record<string, unknown>): string {
  const id = tweetIdOf(tweetResult) ?? '';
  const author = extractAuthor(tweetResult);
  const base = author?.screenName
    ? `https://x.com/${author.screenName}`
    : 'https://x.com/i';
  return `${base}/status/${id}`;
}

export function buildTitle(author: Author | undefined, text: string): string {
  const prefix = author?.name
    ? `${author.name} (@${author.screenName})`
    : '推文';
  const excerpt = text.replace(/\s+/g, ' ').slice(0, 100);
  return `${prefix} 在 X 上：${excerpt || '（无正文）'}`;
}

export function renderMedia(media: MediaItem): string {
  const marker =
    media.type === 'video'
      ? '视频'
      : media.type === 'animated_gif'
        ? 'GIF'
        : '';
  const alt =
    media.altText === undefined
      ? ''
      : ` alt="${escapeHTMLText(media.altText)}"`;
  return `<figure class="capture-media-item${marker ? ' capture-media-video' : ''}">
  <capture-image ref="${escapeHTMLText(media.mediaKey)}"${alt}></capture-image>
  ${marker ? `<figcaption class="capture-media-marker">${marker}</figcaption>` : ''}
</figure>`;
}

export function renderTweet(
  tweetResult: Record<string, unknown>,
  depth: number,
  groupRefs: ReadonlyMap<string, string> = new Map()
): string {
  const author = extractAuthor(tweetResult);
  const createdAt = tweetCreatedAt(tweetResult);
  const text = tweetText(tweetResult);
  const translation = tweetTranslation(tweetResult);
  const mediaItems = extractMedia(tweetResult);
  const authorHTML = author
    ? `<span class="capture-author-name">${escapeHTMLText(
        author.name
      )}</span> <span class="capture-author-handle">@${escapeHTMLText(
        author.screenName
      )}</span>`
    : '';
  const timeHTML =
    createdAt === undefined
      ? ''
      : `<time datetime="${createdAt.toISOString()}">${escapeHTMLText(
          formatDateTime(createdAt)
        )}</time>`;
  // 从正文移除媒体 t.co 链接（#66：Twitter 网站将 t.co 渲染为图片，不显示为文本）
  const cleanedText = removeMediaLinks(text, mediaItems);
  const textHTML =
    cleanedText === '' ? '' : `<div class="capture-text">${renderText(cleanedText)}</div>`;
  // X 自带翻译：原文与译文同时显示，译文前加语言标识
  const translatedHTML =
    translation === undefined
      ? ''
      : `<div class="capture-text capture-text-translated"><span class="capture-translate-label">翻译（${escapeHTMLText(
          translation.sourceLanguage
        )} → ${escapeHTMLText(
          translation.destinationLanguage
        )}）</span>${renderText(translation.translation)}</div>`;
  // 分片组只渲染一次，ref 指向拼合后的完整图；其余媒体逐一渲染
  const renderedMedia: string[] = [];
  const seenGroups = new Set<string>();
  for (const media of mediaItems) {
    const groupKey = groupRefs.get(media.mediaKey);
    if (groupKey === undefined) {
      renderedMedia.push(renderMedia(media));
    } else if (!seenGroups.has(groupKey)) {
      seenGroups.add(groupKey);
      renderedMedia.push(renderMedia({ ...media, mediaKey: groupKey }));
    }
  }
  const mediaHTML =
    renderedMedia.length === 0
      ? ''
      : `<div class="capture-media">${renderedMedia.join('')}</div>`;
  const quotedHTML =
    depth < MAX_QUOTED_DEPTH
      ? (() => {
          const quoted = quotedTweetResult(tweetResult);
          return quoted === undefined
            ? ''
            : `<blockquote class="capture-quoted">${renderTweet(
                quoted,
                depth + 1,
                groupRefs
              )}</blockquote>`;
        })()
      : '';
  return `<article class="capture-tweet">
  <header class="capture-header">
    ${authorHTML}
    <a class="capture-permalink" href="${escapeHTMLText(
      tweetURL(tweetResult)
    )}">原文</a>
    ${timeHTML}
  </header>
  ${textHTML}
  ${translatedHTML}
  ${mediaHTML}
  ${quotedHTML}
</article>`;
}

/** 写入 JSON 块时把 `</` 转义为 `<\/`（JSON 合法），避免推文正文闭合脚本块 */
export function escapeJSONText(text: string): string {
  return text.replace(/<\//g, '<\\/');
}

export function serializeJSON(value: unknown): string {
  return escapeJSONText(JSON.stringify(value) ?? 'null');
}

/** 多行（缩进 2）序列化，便于人工调试 */
export function serializeJSONPretty(value: unknown): string {
  return escapeJSONText(JSON.stringify(value, null, 2) ?? 'null');
}

/** 把响应原文格式化为多行 JSON；解析失败时原样返回 */
export function prettifyResponseText(text: string): string {
  try {
    return escapeJSONText(JSON.stringify(JSON.parse(text), null, 2) ?? 'null');
  } catch {
    return escapeJSONText(text);
  }
}

export function renderDocument(
  tweetResult: Record<string, unknown>,
  rawResponse: string,
  images: Record<string, ImageEntry>,
  groupRefs: ReadonlyMap<string, string> = new Map()
): string {
  const author = extractAuthor(tweetResult);
  const createdAt = tweetCreatedAt(tweetResult);
  const text = tweetText(tweetResult);
  const url = tweetURL(tweetResult);
  const mediaItems = extractMedia(tweetResult);
  // 从正文移除媒体 t.co 链接（#66），用于标题与 OG 描述
  const cleanedText = removeMediaLinks(text, mediaItems);
  const title = buildTitle(author, cleanedText);
  const imageURLs = mediaItems
    .map((media) => images[media.mediaKey]?.url)
    .filter((i): i is string => i !== undefined);

  // 公开标准层：Schema.org SocialMediaPosting
  const ldJSON: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SocialMediaPosting',
    headline: title,
    text: cleanedText,
    url,
    author: {
      '@type': 'Person',
      name: author?.name ?? '',
      ...(author?.screenName
        ? { url: `https://x.com/${author.screenName}` }
        : {}),
    },
  };
  if (createdAt !== undefined) {
    ldJSON['datePublished'] = createdAt.toISOString();
  }
  if (imageURLs.length > 0) {
    ldJSON['image'] = imageURLs;
  }

  // 公开标准层：OG meta
  const ogTags = [
    '<meta property="og:type" content="article">',
    `<meta property="og:url" content="${escapeHTMLText(url)}">`,
    `<meta property="og:title" content="${escapeHTMLText(title)}">`,
    `<meta property="og:description" content="${escapeHTMLText(
      cleanedText.slice(0, 200)
    )}">`,
    ...(imageURLs[0] === undefined
      ? []
      : [
          `<meta property="og:image" content="${escapeHTMLText(imageURLs[0])}">`,
        ]),
  ].join('\n');

  return `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHTMLText(title)}</title>
${ogTags}
<script type="application/ld+json">
${serializeJSONPretty(ldJSON)}
</script>
<style>
body { font-family: system-ui, sans-serif; margin: 0; padding: 24px; color: #0f1419; background: #fff; line-height: 1.6; }
.capture-tweet { max-width: 600px; margin: 0 auto; }
.capture-header { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
.capture-author-name { font-weight: 700; }
.capture-author-handle { color: #536471; }
.capture-permalink { color: #1d9bf0; text-decoration: none; }
.capture-text { white-space: pre-wrap; word-break: break-word; margin: 12px 0; }
.capture-text a { color: #1d9bf0; }
.capture-media { display: flex; flex-wrap: wrap; gap: 8px; }
.capture-media-item { margin: 0; position: relative; max-width: 100%; }
.capture-media-item img { display: block; max-width: 100%; border-radius: 12px; }
.capture-media-video capture-image { display: block; }
.capture-media-marker { position: absolute; top: 8px; left: 8px; background: rgba(0,0,0,0.6); color: #fff; border-radius: 6px; padding: 2px 8px; font-size: 12px; }
.capture-quoted { border-left: 4px solid #cfd9de; margin: 12px 0; padding: 0 12px; }
.capture-translate-label { display: block; margin-bottom: 8px; color: #536471; font-size: 13px; }
</style>
</head>
<body>
<main>
${renderTweet(tweetResult, 0, groupRefs)}
</main>
<script type="application/json" id="twitter-capture-raw">
${prettifyResponseText(rawResponse)}
</script>
<script type="application/json" id="twitter-capture-images">
${serializeJSONPretty(images)}
</script>
<script>
(() => {
  const images = JSON.parse(document.getElementById('twitter-capture-images')?.textContent ?? '{}');
  class CaptureImage extends HTMLElement {
    connectedCallback() {
      const ref = this.getAttribute('ref');
      const entry = ref === null ? undefined : images[ref];
      if (entry === undefined) {
        return;
      }
      const img = document.createElement('img');
      img.src = entry.data ?? entry.url;
      img.alt = this.getAttribute('alt') ?? '';
      this.append(img);
    }
  }
  customElements.define('capture-image', CaptureImage);
})();
</script>
</body>
</html>`;
}

// #endregion
