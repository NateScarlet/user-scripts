// ==UserScript==
// @name     X (Twitter) 推文捕获
// @namespace https://github.com/NateScarlet/user-scripts
// @description 在推文详情页自动把当前推文保存为自包含 HTML 文件
// @include  https://x.com/*
// @include  https://twitter.com/*
// @grant    unsafeWindow
// @run-at   document-start
// ==/UserScript==

import downloadFile from '@/utils/downloadFile';
import {
  TWEET_GRAPHQL_OPERATION_PATTERN,
  collectMediaItems,
  findTweetResult,
  formatUTCDate,
  groupSlicedMedia,
  isEdgeContinuous,
  matchTweetId,
  meanAbsChannelDiff,
  panoramaLayout,
  renderDocument,
  tweetCreatedAt,
  tweetIdOf,
} from './capture-lib';
import type { ImageEntry, MediaItem, PanoramaLayout } from './capture-lib';

// #region 页面上下文访问

/**
 * Greasemonkey 4+ 始终在沙箱中运行脚本（@grant none 也不例外），
 * 沙箱的 XMLHttpRequest/fetch 与页面不是同一对象，必须经 unsafeWindow
 * 打到页面真实全局上。Tampermonkey/Violentmonkey 同样提供 unsafeWindow。
 */
const pageWindow = unsafeWindow as Window & typeof globalThis;

/**
 * Firefox（Greasemonkey）需要 exportFunction 才能把沙箱函数挂到页面对象上，
 * 其他管理器无此函数或不需要，直接原样返回。
 */
function exportToPage<T extends (...args: never[]) => unknown>(fn: T): T {
  const exportFn = (
    globalThis as { exportFunction?: (fn: unknown, target: object) => unknown }
  ).exportFunction;
  return exportFn === undefined ? fn : (exportFn(fn, pageWindow) as T);
}

// #endregion

// #region 日志

const LOG_PREFIX = '[X capture]';

/** 统一前缀日志，便于在控制台过滤排查 */
function captureLog(...args: unknown[]): void {
  console.log(LOG_PREFIX, ...args);
}

// #endregion

// #region 当前推文状态（URL 驱动）

const CAPTURE_TIMEOUT_MS = 10_000;
const HINT_AUTO_DISMISS_MS = 8_000;

let currentTweetId: string | undefined;
/** 本次访问已捕获的推文 id：同一推文的多个响应（如 TweetDetail 与 TweetResultByRestId 同页双发）只落盘一次；URL 变化后重置 */
let capturedTweetId: string | undefined;
let captureTimer: number | undefined;

/**
 * 挂钩在所有 x.com 页面安装并常驻（客户端路由不重载文档），
 * 仅在推文详情页上进入捕获等待状态，非推文详情页直接返回。
 */
function onURLChange(): void {
  const tweetId = matchTweetId(location.pathname);
  if (tweetId === currentTweetId) {
    return;
  }
  currentTweetId = tweetId;
  capturedTweetId = undefined;
  clearCaptureTimer();
  if (tweetId === undefined) {
    captureLog('离开推文详情页', location.pathname);
    return;
  }
  captureLog('进入推文详情页，等待捕获', tweetId, location.pathname);
  captureTimer = window.setTimeout(() => {
    captureTimer = undefined;
    showCaptureHint();
  }, CAPTURE_TIMEOUT_MS);
}

function clearCaptureTimer(): void {
  if (captureTimer !== undefined) {
    window.clearTimeout(captureTimer);
    captureTimer = undefined;
  }
}

// #endregion

// #region 网络挂钩（复用页面自身请求，不自行构造请求）

function hookNetwork(): boolean {
  try {
    // XHR 挂钩：patch 页面真实的 XMLHttpRequest.prototype.open
    const originalOpen = pageWindow.XMLHttpRequest.prototype.open;
    pageWindow.XMLHttpRequest.prototype.open = exportToPage(function (
      this: XMLHttpRequest,
      method: string,
      url: string | URL,
      ...rest: unknown[]
    ): void {
      const urlString = typeof url === 'string' ? url : url.href;
      if (TWEET_GRAPHQL_OPERATION_PATTERN.test(urlString)) {
        this.addEventListener('load', () => {
          handleGraphQLResponse(urlString, this.responseText);
        });
      }
      // 原样转发参数，不能补显式 undefined：Firefox 对显式传入的
      // async=undefined 会 ToBoolean 成 false，把原本异步的 XHR 变成同步，
      // 导致页面随后设置 timeout/responseType 时抛 DOMException
      Reflect.apply(originalOpen, this, [method, url, ...rest]);
    });

    // fetch 挂钩：Firefox 页面 window.fetch 可能同样只读，无法覆盖时仅保留 XHR
    const originalFetch = pageWindow.fetch;
    const wrappedFetch = exportToPage(async function wrappedFetch(
      this: Window,
      input: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> {
      const response = await originalFetch.call(pageWindow, input, init);
      const urlString =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : input.url;
      if (TWEET_GRAPHQL_OPERATION_PATTERN.test(urlString)) {
        try {
          const clone = response.clone();
          void inspectFetchResponse(urlString, clone);
        } catch (err) {
          console.error(LOG_PREFIX, '处理 fetch 响应失败', err);
        }
      }
      return response;
    });
    try {
      pageWindow.fetch = wrappedFetch;
    } catch {
      try {
        Object.defineProperty(pageWindow, 'fetch', {
          configurable: true,
          value: wrappedFetch,
        });
      } catch {
        console.warn(
          LOG_PREFIX,
          '无法覆盖页面 window.fetch（只读），仅保留 XHR 挂钩'
        );
        return false;
      }
    }
    return true;
  } catch (err) {
    console.error(LOG_PREFIX, '网络挂钩安装失败', err);
    return false;
  }
}

function hookHistory(): void {
  try {
    const wrapHistoryMethod = (method: 'pushState' | 'replaceState'): void => {
      const original = pageWindow.history[method];
      pageWindow.history[method] = exportToPage(function (
        this: History,
        data: unknown,
        unused: string,
        url?: string | URL | null
      ): void {
        original.call(this, data, unused, url);
        onURLChange();
      });
    };
    wrapHistoryMethod('pushState');
    wrapHistoryMethod('replaceState');
    pageWindow.addEventListener('popstate', onURLChange);
  } catch (err) {
    console.error(LOG_PREFIX, 'history 挂钩安装失败', err);
  }
}

async function inspectFetchResponse(
  url: string,
  clone: Response
): Promise<void> {
  const text = await clone.text();
  handleGraphQLResponse(url, text);
}

// #endregion

// #region 响应解析

function handleGraphQLResponse(url: string, body: string): void {
  const expectedTweetId = currentTweetId;
  if (expectedTweetId === undefined) {
    return;
  }
  const operation = TWEET_GRAPHQL_OPERATION_PATTERN.exec(url)?.[1];
  if (operation === undefined) {
    return;
  }
  captureLog('收到推文详情响应', operation, `等待=${expectedTweetId}`);
  let data: unknown;
  try {
    data = JSON.parse(body);
  } catch (err) {
    console.warn(LOG_PREFIX, '响应不是合法 JSON', operation, err);
    return;
  }
  const tweetResult = findTweetResult(
    data,
    operation,
    expectedTweetId,
    captureLog
  );
  if (tweetResult === undefined) {
    captureLog('未找到目标推文，跳过', operation, expectedTweetId);
    return;
  }
  const tweetId = tweetIdOf(tweetResult);
  if (tweetId === capturedTweetId) {
    captureLog('已跳过（本次访问已捕获）', tweetId);
    return;
  }
  capturedTweetId = tweetId;
  clearCaptureTimer();
  captureLog('开始捕获推文', tweetId);
  // raw 层保存响应原文文本（不做裁剪），而非重新序列化
  void captureTweet(tweetResult, body).catch((err) => {
    console.error(LOG_PREFIX, '捕获失败', err);
  });
}

// #endregion

// #region 媒体抓取

async function fetchImage(media: MediaItem): Promise<ImageEntry> {
  let data: string | undefined;
  try {
    // 用页面真实 fetch（沙箱 fetch 在 Greasemonkey 下可能是空壳）
    const response = await pageWindow.fetch(media.url);
    if (response.ok) {
      data = await blobToDataURL(await response.blob());
    } else {
      console.warn(LOG_PREFIX, `图片抓取失败 ${response.status}: ${media.url}`);
    }
  } catch (err) {
    console.warn(LOG_PREFIX, `图片抓取失败，仅保留原图 URL: ${media.url}`, err);
  }
  return { url: media.url, data };
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result)));
    reader.addEventListener('error', () =>
      reject(reader.error ?? new Error('读取图片失败'))
    );
    reader.readAsDataURL(blob);
  });
}

function loadImage(src: string): Promise<HTMLImageElement | undefined> {
  return new Promise((resolve) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', () => resolve(undefined));
    img.src = src;
  });
}

/**
 * 校验相邻分片在切割线两侧的像素是否连续：跨片差异应接近片内基线。
 * 任一接缝不连续即判定不是同一张图的分片，防止把无关同尺寸图片误拼。
 */
function verifySeams(
  context: CanvasRenderingContext2D,
  layout: PanoramaLayout
): boolean {
  for (let i = 0; i < layout.places.length - 1; i += 1) {
    const prev = layout.places[i]!;
    const next = layout.places[i + 1]!;
    let between: number;
    let prevWithin: number;
    let nextWithin: number;
    if (layout.direction === 'horizontal') {
      const strip = (x: number): Uint8ClampedArray =>
        context.getImageData(x, 0, 1, layout.height).data;
      between = meanAbsChannelDiff(
        strip(prev.x + prev.width - 1),
        strip(next.x)
      );
      prevWithin = meanAbsChannelDiff(
        strip(prev.x + prev.width - 2),
        strip(prev.x + prev.width - 1)
      );
      nextWithin = meanAbsChannelDiff(strip(next.x), strip(next.x + 1));
    } else {
      const strip = (y: number): Uint8ClampedArray =>
        context.getImageData(0, y, layout.width, 1).data;
      between = meanAbsChannelDiff(
        strip(prev.y + prev.height - 1),
        strip(next.y)
      );
      prevWithin = meanAbsChannelDiff(
        strip(prev.y + prev.height - 2),
        strip(prev.y + prev.height - 1)
      );
      nextWithin = meanAbsChannelDiff(strip(next.y), strip(next.y + 1));
    }
    const within = (prevWithin + nextWithin) / 2;
    if (!isEdgeContinuous(between, within)) {
      captureLog(
        '分片边缘不连续，判定非同一张图的分片',
        `between=${between.toFixed(1)}`,
        `within=${within.toFixed(1)}`
      );
      return false;
    }
  }
  return true;
}

/** canvas 导出：优先 AVIF，其次 WebP，浏览器都不支持时退回 JPEG（按返回前缀判断实际编码） */
function canvasToDataURL(canvas: HTMLCanvasElement): string {
  const avif = canvas.toDataURL('image/avif', 0.9);
  if (avif.startsWith('data:image/avif')) {
    return avif;
  }
  const webp = canvas.toDataURL('image/webp', 0.9);
  if (webp.startsWith('data:image/webp')) {
    return webp;
  }
  return canvas.toDataURL('image/jpeg', 0.9);
}

/** 把分片按布局拼成一张完整图，返回 data URL；任一片加载失败或边缘不连续则放弃拼接 */
async function stitchPanorama(
  group: MediaItem[],
  images: Record<string, ImageEntry>
): Promise<string | undefined> {
  const layout = panoramaLayout(group);
  if (layout === undefined) {
    return undefined;
  }
  const canvas = document.createElement('canvas');
  canvas.width = layout.width;
  canvas.height = layout.height;
  const context = canvas.getContext('2d');
  if (context === null) {
    return undefined;
  }
  const loaded = await Promise.all(
    group.map((item) => {
      const entry = images[item.mediaKey];
      const src = entry === undefined ? undefined : (entry.data ?? entry.url);
      return src === undefined ? Promise.resolve(undefined) : loadImage(src);
    })
  );
  if (loaded.some((img) => img === undefined)) {
    return undefined;
  }
  for (let i = 0; i < loaded.length; i += 1) {
    const place = layout.places[i]!;
    context.drawImage(loaded[i]!, place.x, place.y, place.width, place.height);
  }
  if (!verifySeams(context, layout)) {
    return undefined;
  }
  return canvasToDataURL(canvas);
}

// #endregion

// #region 下载与页面提示

function makeFilename(tweetResult: Record<string, unknown>): string {
  // 沿用 downloadFile 默认命名形态（URL 末段 + 页面标题），扩展名 .html；
  // URL 末段取推文 id，子路径（如 /photo/1）下仍稳定；含推文发布时间时附加日期
  const tweetId = tweetIdOf(tweetResult) ?? '';
  const createdAt = tweetCreatedAt(tweetResult);
  const date = createdAt === undefined ? '' : ` ${formatUTCDate(createdAt)}`;
  const title = document.title.replace(/[\\/:*?"<>|]/g, '_').trim();
  return `${tweetId} ${title}${date}.html`;
}

async function captureTweet(
  tweetResult: Record<string, unknown>,
  rawResponse: string
): Promise<void> {
  const mediaItems = collectMediaItems(tweetResult);
  captureLog('抓取媒体图片', mediaItems.length, '张');
  const images: Record<string, ImageEntry> = {};
  await Promise.all(
    mediaItems.map(async (media) => {
      images[media.mediaKey] = await fetchImage(media);
    })
  );
  // 检测并拼合分片全景图：同一 display_url 且尺寸一致（±1px）的媒体为一张图的分片，
  // 拼合成功才建立组映射（正文按组渲染一次），失败则保留原分片逐张渲染
  const groups = groupSlicedMedia(mediaItems);
  const groupRefs = new Map<string, string>();
  for (const group of groups) {
    const groupKey = group[0]?.displayUrl;
    if (groupKey === undefined) {
      continue;
    }
    const stitched = await stitchPanorama(group, images);
    if (stitched === undefined) {
      captureLog('分片拼接失败，保留原分片', groupKey);
      continue;
    }
    for (const item of group) {
      groupRefs.set(item.mediaKey, groupKey);
    }
    // 拼合图无对应源图 URL，只写内联数据
    images[groupKey] = { data: stitched };
    captureLog('已拼合分片全景图', groupKey);
  }
  const html = renderDocument(tweetResult, rawResponse, images, groupRefs);
  captureLog('生成 HTML', `${html.length} 字节`);
  const filename = makeFilename(tweetResult);
  downloadFile(new Blob([html], { type: 'text/html' }), filename);
  const tweetId = tweetIdOf(tweetResult) ?? '';
  captureLog('已保存为 HTML', tweetId, filename);
}

/** 捕获超时提示：轻量、不阻塞页面、可点击或自动消失 */
function showCaptureHint(): void {
  captureLog(
    '等待超时（10 秒）未捕获到推文数据，显示页面提示',
    location.pathname
  );
  const hint = document.createElement('div');
  hint.textContent = '未能捕获到推文数据（可能内容受限或加载超时）';
  Object.assign(hint.style, {
    position: 'fixed',
    top: '16px',
    right: '16px',
    zIndex: '2147483647',
    padding: '10px 14px',
    background: 'rgba(15, 20, 25, 0.9)',
    color: '#fff',
    borderRadius: '8px',
    fontSize: '14px',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
    cursor: 'pointer',
  } satisfies Partial<CSSStyleDeclaration>);
  hint.addEventListener('click', () => hint.remove());
  document.documentElement.append(hint);
  window.setTimeout(() => hint.remove(), HINT_AUTO_DISMISS_MS);
}

// #endregion

const fetchHooked = hookNetwork();
hookHistory();
onURLChange();
captureLog(
  '脚本已启动',
  location.href,
  `fetch=${fetchHooked ? '已挂钩' : '未挂钩（XHR 仍可用）'}`
);
