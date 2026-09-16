// ==UserScript==
// @name     X (Twitter) 推文捕获
// @namespace https://github.com/NateScarlet/user-scripts
// @description 在推文详情页自动把当前推文保存为自包含 HTML 文件
// @include  https://x.com/*
// @include  https://twitter.com/*
// @grant    unsafeWindow
// @run-at   document-start
// @version   2026.09.17+b4d65e4e
// ==/UserScript==

"use strict";
(() => {
  // src/utils/urlLastPart.ts
  function urlLastPart(url) {
    return url.split("/").filter((i) => i).slice(-1)[0];
  }

  // src/utils/downloadFile.ts
  function downloadFile(file, filename = `${urlLastPart(location.pathname)} ${document.title}.md`) {
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(file);
    anchor.download = filename;
    anchor.style["display"] = "none";
    document.body.append(anchor);
    anchor.click();
    setTimeout(() => {
      document.body.removeChild(anchor);
      URL.revokeObjectURL(anchor.href);
    }, 0);
  }

  // src/x.com/capture-lib.ts
  var TWEET_GRAPHQL_OPERATION_PATTERN = /\/graphql\/.+?\/(TweetDetail|TweetResultByRestId)(?:[?&]|$)/;
  var TWEET_STATUS_PATTERN = /^\/(?:i\/status\/(\d+)|[^/]+\/status\/(\d+))(?:\/.*)?$/;
  var TWITTER_DATE_PATTERN = /^[A-Za-z]{3} ([A-Za-z]{3}) (\d{2}) (\d{2}):(\d{2}):(\d{2}) ([+-]\d{4}) (\d{4})$/;
  var MONTH_INDEX = {
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
    Dec: 11
  };
  var MAX_QUOTED_DEPTH = 3;
  function isPlainObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
  function asString(value) {
    return typeof value === "string" ? value : void 0;
  }
  function matchTweetId(pathname) {
    const match = TWEET_STATUS_PATTERN.exec(pathname);
    return match?.[1] ?? match?.[2];
  }
  function normalizeTweetResult(result) {
    if (!isPlainObject(result)) {
      return void 0;
    }
    if (result.__typename === "Tweet") {
      return result;
    }
    if (result.__typename === "TweetWithVisibilityResults") {
      return isPlainObject(result.tweet) ? result.tweet : void 0;
    }
    return void 0;
  }
  function tweetIdOf(tweetResult) {
    const restId = asString(tweetResult.rest_id);
    if (restId !== void 0) {
      return restId;
    }
    const legacy = tweetResult.legacy;
    return isPlainObject(legacy) ? asString(legacy.id_str) : void 0;
  }
  function findTweetResult(data, operation, expectedTweetId, log = () => void 0) {
    const root = isPlainObject(data) ? data.data : void 0;
    if (!isPlainObject(root)) {
      log("响应中没有 data 节点");
      return void 0;
    }
    if (operation === "TweetDetail") {
      const conversation = root.threaded_conversation_with_injections_v2;
      if (!isPlainObject(conversation)) {
        log("响应中没有 threaded_conversation_with_injections_v2 节点");
        return void 0;
      }
      const instructions = conversation.instructions;
      if (!Array.isArray(instructions)) {
        log("响应中 instructions 缺失");
        return void 0;
      }
      for (const instruction of instructions) {
        if (!isPlainObject(instruction) || instruction.type !== "TimelineAddEntries") {
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
          if (entryId === void 0 || !entryId.startsWith("tweet-")) {
            continue;
          }
          const itemContent = isPlainObject(entry.content) ? entry.content.itemContent : void 0;
          const tweetResults = isPlainObject(itemContent) ? itemContent.tweet_results : void 0;
          const tweetResult2 = isPlainObject(tweetResults) ? normalizeTweetResult(tweetResults.result) : void 0;
          if (tweetResult2 !== void 0 && tweetIdOf(tweetResult2) === expectedTweetId) {
            return tweetResult2;
          }
          log(
            "TimelineAddEntries 中推文条目不匹配",
            entryId,
            `等待=${expectedTweetId}`
          );
        }
      }
      log("TimelineAddEntries 中未找到目标推文", expectedTweetId);
      return void 0;
    }
    const tweetResult = root.tweetResult;
    if (!isPlainObject(tweetResult)) {
      log("响应中没有 tweetResult 节点");
      return void 0;
    }
    const normalized = normalizeTweetResult(tweetResult.result);
    if (normalized === void 0 || tweetIdOf(normalized) !== expectedTweetId) {
      log("TweetResultByRestId 不匹配目标推文", expectedTweetId);
      return void 0;
    }
    return normalized;
  }
  function extractAuthor(tweetResult) {
    const core = tweetResult.core;
    if (!isPlainObject(core)) {
      return void 0;
    }
    const userResults = core.user_results;
    if (!isPlainObject(userResults)) {
      return void 0;
    }
    const user = userResults.result;
    if (!isPlainObject(user)) {
      return void 0;
    }
    const userCore = isPlainObject(user.core) ? user.core : void 0;
    const userLegacy = isPlainObject(user.legacy) ? user.legacy : void 0;
    const name = asString(userCore?.name) ?? asString(userLegacy?.name) ?? "";
    const screenName = asString(userCore?.screen_name) ?? asString(userLegacy?.screen_name) ?? "";
    if (name === "" && screenName === "") {
      return void 0;
    }
    return { name, screenName };
  }
  function tweetText(tweetResult) {
    const noteTweet = tweetResult.note_tweet;
    if (isPlainObject(noteTweet)) {
      const noteTweetResults = noteTweet.note_tweet_results;
      if (isPlainObject(noteTweetResults)) {
        const noteResult = noteTweetResults.result;
        if (isPlainObject(noteResult)) {
          const noteText = asString(noteResult.text);
          if (noteText !== void 0) {
            return noteText;
          }
        }
      }
    }
    const legacy = tweetResult.legacy;
    return isPlainObject(legacy) ? asString(legacy.full_text) ?? "" : "";
  }
  function tweetTranslation(tweetResult) {
    const grok = tweetResult.grok_translated_post_with_availability;
    if (!isPlainObject(grok) || grok.is_available !== true) {
      return void 0;
    }
    const data = grok.data;
    if (!isPlainObject(data)) {
      return void 0;
    }
    const translation = asString(data.translation);
    if (translation === void 0) {
      return void 0;
    }
    return {
      translation,
      sourceLanguage: asString(data.source_language) ?? "",
      destinationLanguage: asString(data.destination_language) ?? ""
    };
  }
  function parseTwitterDate(input) {
    if (input === void 0) {
      return void 0;
    }
    const match = TWITTER_DATE_PATTERN.exec(input);
    if (match !== null) {
      const month = MONTH_INDEX[match[1]];
      if (month !== void 0) {
        const tz = match[6];
        const tzOffsetMinutes = (parseInt(tz.slice(1, 3), 10) * 60 + parseInt(tz.slice(3), 10)) * (tz[0] === "-" ? -1 : 1);
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
    return Number.isNaN(fallback.getTime()) ? void 0 : fallback;
  }
  function tweetCreatedAt(tweetResult) {
    const legacy = tweetResult.legacy;
    return isPlainObject(legacy) ? parseTwitterDate(asString(legacy.created_at)) : void 0;
  }
  function quotedTweetResult(tweetResult) {
    const quotedStatusResult = tweetResult.quoted_status_result;
    return isPlainObject(quotedStatusResult) ? normalizeTweetResult(quotedStatusResult.result) : void 0;
  }
  function extractMedia(tweetResult) {
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
    const result = [];
    for (const item of media) {
      if (!isPlainObject(item)) {
        continue;
      }
      const mediaKey = asString(item.media_key);
      const mediaUrlHttps = asString(item.media_url_https);
      if (mediaKey === void 0 || mediaUrlHttps === void 0) {
        continue;
      }
      const type = asString(item.type) ?? "photo";
      const originalInfo = isPlainObject(item.original_info) ? item.original_info : void 0;
      const width = typeof originalInfo?.width === "number" ? originalInfo.width : void 0;
      const height = typeof originalInfo?.height === "number" ? originalInfo.height : void 0;
      result.push({
        mediaKey,
        url: originalMediaURL(mediaUrlHttps, type),
        type,
        altText: asString(item.ext_alt_text),
        width,
        height,
        displayUrl: asString(item.display_url),
        tcoUrl: asString(item.url),
        indices: Array.isArray(item.indices) && typeof item.indices[0] === "number" && typeof item.indices[1] === "number" ? [item.indices[0], item.indices[1]] : void 0
      });
    }
    return result;
  }
  function groupSlicedMedia(items) {
    const groups = [];
    let current = [];
    for (const item of items) {
      const canJoin = current.length > 0 && item.displayUrl !== void 0 && item.width !== void 0 && item.height !== void 0 && item.displayUrl === current[0].displayUrl && Math.abs((current[0].width ?? 0) - item.width) <= 1 && Math.abs((current[0].height ?? 0) - item.height) <= 1;
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
  function panoramaLayout(group) {
    const first = group[0];
    if (first === void 0 || first.width === void 0 || first.height === void 0) {
      return void 0;
    }
    const horizontal = first.height >= first.width;
    let width = 0;
    let height = 0;
    const places = [];
    for (const item of group) {
      const w = item.width ?? first.width;
      const h = item.height ?? first.height;
      places.push(
        horizontal ? { x: width, y: 0, width: w, height: h } : { x: 0, y: height, width: w, height: h }
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
      direction: horizontal ? "horizontal" : "vertical",
      places
    };
  }
  function meanAbsChannelDiff(a, b) {
    if (a.length !== b.length || a.length === 0) {
      return Infinity;
    }
    let sum = 0;
    const channels = a.length / 4 * 3;
    for (let i = 0; i < a.length; i += 4) {
      sum += Math.abs(a[i] - b[i]);
      sum += Math.abs(a[i + 1] - b[i + 1]);
      sum += Math.abs(a[i + 2] - b[i + 2]);
    }
    return sum / channels;
  }
  var EDGE_CONTINUITY_FACTOR = 2;
  var EDGE_CONTINUITY_EPSILON = 8;
  function isEdgeContinuous(between, within) {
    return Number.isFinite(between) && Number.isFinite(within) && between <= within * EDGE_CONTINUITY_FACTOR + EDGE_CONTINUITY_EPSILON;
  }
  function originalMediaURL(mediaUrl, type) {
    if (type === "photo") {
      const match = /^(https?:\/\/pbs\.twimg\.com\/media\/.+)\.(\w+)$/.exec(
        mediaUrl
      );
      if (match === null) {
        return `${mediaUrl}?name=orig`;
      }
      return `${match[1]}?format=${match[2]}&name=orig`;
    }
    const thumbnailURL = new URL(mediaUrl);
    thumbnailURL.pathname += ":orig";
    return thumbnailURL.href;
  }
  function collectMediaItems(tweetResult, depth = 0) {
    const items = extractMedia(tweetResult);
    if (depth < MAX_QUOTED_DEPTH) {
      const quoted = quotedTweetResult(tweetResult);
      if (quoted !== void 0) {
        items.push(...collectMediaItems(quoted, depth + 1));
      }
    }
    return items;
  }
  function pad2(value) {
    return String(value).padStart(2, "0");
  }
  function formatUTCDate(date) {
    return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(
      date.getUTCDate()
    )}`;
  }
  function formatDateTime(date) {
    return `${formatUTCDate(date)} ${pad2(date.getUTCHours())}:${pad2(
      date.getUTCMinutes()
    )} UTC`;
  }
  function escapeHTMLText(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function renderText(text) {
    return escapeHTMLText(text).replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" rel="nofollow">$1</a>'
    );
  }
  function removeMediaLinks(text, media) {
    if (media.length === 0 || text === "") {
      return text;
    }
    const seen = /* @__PURE__ */ new Set();
    for (const m of media) {
      if (m.tcoUrl === void 0 || seen.has(m.tcoUrl)) {
        continue;
      }
      seen.add(m.tcoUrl);
      text = text.split(m.tcoUrl).join("");
    }
    return text.replace(/\s+/g, " ").trim();
  }
  function tweetURL(tweetResult) {
    const id = tweetIdOf(tweetResult) ?? "";
    const author = extractAuthor(tweetResult);
    const base = author?.screenName ? `https://x.com/${author.screenName}` : "https://x.com/i";
    return `${base}/status/${id}`;
  }
  function buildTitle(author, text) {
    const prefix = author?.name ? `${author.name} (@${author.screenName})` : "推文";
    const excerpt = text.replace(/\s+/g, " ").slice(0, 100);
    return `${prefix} 在 X 上：${excerpt || "（无正文）"}`;
  }
  function renderMedia(media) {
    const marker = media.type === "video" ? "视频" : media.type === "animated_gif" ? "GIF" : "";
    const alt = media.altText === void 0 ? "" : ` alt="${escapeHTMLText(media.altText)}"`;
    return `<figure class="capture-media-item${marker ? " capture-media-video" : ""}">
  <capture-image ref="${escapeHTMLText(media.mediaKey)}"${alt}></capture-image>
  ${marker ? `<figcaption class="capture-media-marker">${marker}</figcaption>` : ""}
</figure>`;
  }
  function renderTweet(tweetResult, depth, groupRefs = /* @__PURE__ */ new Map()) {
    const author = extractAuthor(tweetResult);
    const createdAt = tweetCreatedAt(tweetResult);
    const text = tweetText(tweetResult);
    const translation = tweetTranslation(tweetResult);
    const mediaItems = extractMedia(tweetResult);
    const authorHTML = author ? `<span class="capture-author-name">${escapeHTMLText(
      author.name
    )}</span> <span class="capture-author-handle">@${escapeHTMLText(
      author.screenName
    )}</span>` : "";
    const timeHTML = createdAt === void 0 ? "" : `<time datetime="${createdAt.toISOString()}">${escapeHTMLText(
      formatDateTime(createdAt)
    )}</time>`;
    const cleanedText = removeMediaLinks(text, mediaItems);
    const textHTML = cleanedText === "" ? "" : `<div class="capture-text">${renderText(cleanedText)}</div>`;
    const translatedHTML = translation === void 0 ? "" : `<div class="capture-text capture-text-translated"><span class="capture-translate-label">翻译（${escapeHTMLText(
      translation.sourceLanguage
    )} → ${escapeHTMLText(
      translation.destinationLanguage
    )}）</span>${renderText(translation.translation)}</div>`;
    const renderedMedia = [];
    const seenGroups = /* @__PURE__ */ new Set();
    for (const media of mediaItems) {
      const groupKey = groupRefs.get(media.mediaKey);
      if (groupKey === void 0) {
        renderedMedia.push(renderMedia(media));
      } else if (!seenGroups.has(groupKey)) {
        seenGroups.add(groupKey);
        renderedMedia.push(renderMedia({ ...media, mediaKey: groupKey }));
      }
    }
    const mediaHTML = renderedMedia.length === 0 ? "" : `<div class="capture-media">${renderedMedia.join("")}</div>`;
    const quotedHTML = depth < MAX_QUOTED_DEPTH ? (() => {
      const quoted = quotedTweetResult(tweetResult);
      return quoted === void 0 ? "" : `<blockquote class="capture-quoted">${renderTweet(
        quoted,
        depth + 1,
        groupRefs
      )}</blockquote>`;
    })() : "";
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
  function escapeJSONText(text) {
    return text.replace(/<\//g, "<\\/");
  }
  function serializeJSONPretty(value) {
    return escapeJSONText(JSON.stringify(value, null, 2) ?? "null");
  }
  function prettifyResponseText(text) {
    try {
      return escapeJSONText(JSON.stringify(JSON.parse(text), null, 2) ?? "null");
    } catch {
      return escapeJSONText(text);
    }
  }
  function renderDocument(tweetResult, rawResponse, images, groupRefs = /* @__PURE__ */ new Map()) {
    const author = extractAuthor(tweetResult);
    const createdAt = tweetCreatedAt(tweetResult);
    const text = tweetText(tweetResult);
    const url = tweetURL(tweetResult);
    const mediaItems = extractMedia(tweetResult);
    const cleanedText = removeMediaLinks(text, mediaItems);
    const title = buildTitle(author, cleanedText);
    const imageURLs = mediaItems.map((media) => images[media.mediaKey]?.url).filter((i) => i !== void 0);
    const ldJSON = {
      "@context": "https://schema.org",
      "@type": "SocialMediaPosting",
      headline: title,
      text: cleanedText,
      url,
      author: {
        "@type": "Person",
        name: author?.name ?? "",
        ...author?.screenName ? { url: `https://x.com/${author.screenName}` } : {}
      }
    };
    if (createdAt !== void 0) {
      ldJSON["datePublished"] = createdAt.toISOString();
    }
    if (imageURLs.length > 0) {
      ldJSON["image"] = imageURLs;
    }
    const ogTags = [
      '<meta property="og:type" content="article">',
      `<meta property="og:url" content="${escapeHTMLText(url)}">`,
      `<meta property="og:title" content="${escapeHTMLText(title)}">`,
      `<meta property="og:description" content="${escapeHTMLText(
        cleanedText.slice(0, 200)
      )}">`,
      ...imageURLs[0] === void 0 ? [] : [
        `<meta property="og:image" content="${escapeHTMLText(imageURLs[0])}">`
      ]
    ].join("\n");
    return `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHTMLText(title)}</title>
${ogTags}
<script type="application/ld+json">
${serializeJSONPretty(ldJSON)}
<\/script>
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
<\/script>
<script type="application/json" id="twitter-capture-images">
${serializeJSONPretty(images)}
<\/script>
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
<\/script>
</body>
</html>`;
  }

  // src/x.com/capture.user.ts
  var pageWindow = unsafeWindow;
  function exportToPage(fn) {
    const exportFn = globalThis.exportFunction;
    return exportFn === void 0 ? fn : exportFn(fn, pageWindow);
  }
  var LOG_PREFIX = "[X capture]";
  function captureLog(...args) {
    console.log(LOG_PREFIX, ...args);
  }
  var CAPTURE_TIMEOUT_MS = 1e4;
  var HINT_AUTO_DISMISS_MS = 8e3;
  var currentTweetId;
  var capturedTweetId;
  var captureTimer;
  function onURLChange() {
    const tweetId = matchTweetId(location.pathname);
    if (tweetId === currentTweetId) {
      return;
    }
    currentTweetId = tweetId;
    capturedTweetId = void 0;
    clearCaptureTimer();
    if (tweetId === void 0) {
      captureLog("离开推文详情页", location.pathname);
      return;
    }
    captureLog("进入推文详情页，等待捕获", tweetId, location.pathname);
    captureTimer = window.setTimeout(() => {
      captureTimer = void 0;
      showCaptureHint();
    }, CAPTURE_TIMEOUT_MS);
  }
  function clearCaptureTimer() {
    if (captureTimer !== void 0) {
      window.clearTimeout(captureTimer);
      captureTimer = void 0;
    }
  }
  function hookNetwork() {
    try {
      const originalOpen = pageWindow.XMLHttpRequest.prototype.open;
      pageWindow.XMLHttpRequest.prototype.open = exportToPage(function(method, url, ...rest) {
        const urlString = typeof url === "string" ? url : url.href;
        if (TWEET_GRAPHQL_OPERATION_PATTERN.test(urlString)) {
          this.addEventListener("load", () => {
            handleGraphQLResponse(urlString, this.responseText);
          });
        }
        Reflect.apply(originalOpen, this, [method, url, ...rest]);
      });
      const originalFetch = pageWindow.fetch;
      const wrappedFetch = exportToPage(async function wrappedFetch2(input, init) {
        const response = await originalFetch.call(pageWindow, input, init);
        const urlString = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        if (TWEET_GRAPHQL_OPERATION_PATTERN.test(urlString)) {
          try {
            const clone = response.clone();
            void inspectFetchResponse(urlString, clone);
          } catch (err) {
            console.error(LOG_PREFIX, "处理 fetch 响应失败", err);
          }
        }
        return response;
      });
      try {
        pageWindow.fetch = wrappedFetch;
      } catch {
        try {
          Object.defineProperty(pageWindow, "fetch", {
            configurable: true,
            value: wrappedFetch
          });
        } catch {
          console.warn(
            LOG_PREFIX,
            "无法覆盖页面 window.fetch（只读），仅保留 XHR 挂钩"
          );
          return false;
        }
      }
      return true;
    } catch (err) {
      console.error(LOG_PREFIX, "网络挂钩安装失败", err);
      return false;
    }
  }
  function hookHistory() {
    try {
      const wrapHistoryMethod = (method) => {
        const original = pageWindow.history[method];
        pageWindow.history[method] = exportToPage(function(data, unused, url) {
          original.call(this, data, unused, url);
          onURLChange();
        });
      };
      wrapHistoryMethod("pushState");
      wrapHistoryMethod("replaceState");
      pageWindow.addEventListener("popstate", onURLChange);
    } catch (err) {
      console.error(LOG_PREFIX, "history 挂钩安装失败", err);
    }
  }
  async function inspectFetchResponse(url, clone) {
    const text = await clone.text();
    handleGraphQLResponse(url, text);
  }
  function handleGraphQLResponse(url, body) {
    const expectedTweetId = currentTweetId;
    if (expectedTweetId === void 0) {
      return;
    }
    const operation = TWEET_GRAPHQL_OPERATION_PATTERN.exec(url)?.[1];
    if (operation === void 0) {
      return;
    }
    captureLog("收到推文详情响应", operation, `等待=${expectedTweetId}`);
    let data;
    try {
      data = JSON.parse(body);
    } catch (err) {
      console.warn(LOG_PREFIX, "响应不是合法 JSON", operation, err);
      return;
    }
    const tweetResult = findTweetResult(
      data,
      operation,
      expectedTweetId,
      captureLog
    );
    if (tweetResult === void 0) {
      captureLog("未找到目标推文，跳过", operation, expectedTweetId);
      return;
    }
    const tweetId = tweetIdOf(tweetResult);
    if (tweetId === capturedTweetId) {
      captureLog("已跳过（本次访问已捕获）", tweetId);
      return;
    }
    capturedTweetId = tweetId;
    clearCaptureTimer();
    captureLog("开始捕获推文", tweetId);
    void captureTweet(tweetResult, body).catch((err) => {
      console.error(LOG_PREFIX, "捕获失败", err);
    });
  }
  async function fetchImage(media) {
    let data;
    try {
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
  function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(String(reader.result)));
      reader.addEventListener(
        "error",
        () => reject(reader.error ?? new Error("读取图片失败"))
      );
      reader.readAsDataURL(blob);
    });
  }
  function loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.addEventListener("load", () => resolve(img));
      img.addEventListener("error", () => resolve(void 0));
      img.src = src;
    });
  }
  function verifySeams(context, layout) {
    for (let i = 0; i < layout.places.length - 1; i += 1) {
      const prev = layout.places[i];
      const next = layout.places[i + 1];
      let between;
      let prevWithin;
      let nextWithin;
      if (layout.direction === "horizontal") {
        const strip = (x) => context.getImageData(x, 0, 1, layout.height).data;
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
        const strip = (y) => context.getImageData(0, y, layout.width, 1).data;
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
          "分片边缘不连续，判定非同一张图的分片",
          `between=${between.toFixed(1)}`,
          `within=${within.toFixed(1)}`
        );
        return false;
      }
    }
    return true;
  }
  function canvasToDataURL(canvas) {
    const avif = canvas.toDataURL("image/avif", 0.9);
    if (avif.startsWith("data:image/avif")) {
      return avif;
    }
    const webp = canvas.toDataURL("image/webp", 0.9);
    if (webp.startsWith("data:image/webp")) {
      return webp;
    }
    return canvas.toDataURL("image/jpeg", 0.9);
  }
  async function stitchPanorama(group, images) {
    const layout = panoramaLayout(group);
    if (layout === void 0) {
      return void 0;
    }
    const canvas = document.createElement("canvas");
    canvas.width = layout.width;
    canvas.height = layout.height;
    const context = canvas.getContext("2d");
    if (context === null) {
      return void 0;
    }
    const loaded = await Promise.all(
      group.map((item) => {
        const entry = images[item.mediaKey];
        const src = entry === void 0 ? void 0 : entry.data ?? entry.url;
        return src === void 0 ? Promise.resolve(void 0) : loadImage(src);
      })
    );
    if (loaded.some((img) => img === void 0)) {
      return void 0;
    }
    for (let i = 0; i < loaded.length; i += 1) {
      const place = layout.places[i];
      context.drawImage(loaded[i], place.x, place.y, place.width, place.height);
    }
    if (!verifySeams(context, layout)) {
      return void 0;
    }
    return canvasToDataURL(canvas);
  }
  function makeFilename(tweetResult) {
    const tweetId = tweetIdOf(tweetResult) ?? "";
    const createdAt = tweetCreatedAt(tweetResult);
    const date = createdAt === void 0 ? "" : ` ${formatUTCDate(createdAt)}`;
    const title = document.title.replace(/[\\/:*?"<>|]/g, "_").trim();
    return `${tweetId} ${title}${date}.html`;
  }
  async function captureTweet(tweetResult, rawResponse) {
    const mediaItems = collectMediaItems(tweetResult);
    captureLog("抓取媒体图片", mediaItems.length, "张");
    const images = {};
    await Promise.all(
      mediaItems.map(async (media) => {
        images[media.mediaKey] = await fetchImage(media);
      })
    );
    const groups = groupSlicedMedia(mediaItems);
    const groupRefs = /* @__PURE__ */ new Map();
    for (const group of groups) {
      const groupKey = group[0]?.displayUrl;
      if (groupKey === void 0) {
        continue;
      }
      const stitched = await stitchPanorama(group, images);
      if (stitched === void 0) {
        captureLog("分片拼接失败，保留原分片", groupKey);
        continue;
      }
      for (const item of group) {
        groupRefs.set(item.mediaKey, groupKey);
      }
      images[groupKey] = { data: stitched };
      captureLog("已拼合分片全景图", groupKey);
    }
    const html = renderDocument(tweetResult, rawResponse, images, groupRefs);
    captureLog("生成 HTML", `${html.length} 字节`);
    const filename = makeFilename(tweetResult);
    downloadFile(new Blob([html], { type: "text/html" }), filename);
    const tweetId = tweetIdOf(tweetResult) ?? "";
    captureLog("已保存为 HTML", tweetId, filename);
  }
  function showCaptureHint() {
    captureLog(
      "等待超时（10 秒）未捕获到推文数据，显示页面提示",
      location.pathname
    );
    const hint = document.createElement("div");
    hint.textContent = "未能捕获到推文数据（可能内容受限或加载超时）";
    Object.assign(hint.style, {
      position: "fixed",
      top: "16px",
      right: "16px",
      zIndex: "2147483647",
      padding: "10px 14px",
      background: "rgba(15, 20, 25, 0.9)",
      color: "#fff",
      borderRadius: "8px",
      fontSize: "14px",
      boxShadow: "0 2px 12px rgba(0, 0, 0, 0.3)",
      cursor: "pointer"
    });
    hint.addEventListener("click", () => hint.remove());
    document.documentElement.append(hint);
    window.setTimeout(() => hint.remove(), HINT_AUTO_DISMISS_MS);
  }
  var fetchHooked = hookNetwork();
  hookHistory();
  onURLChange();
  captureLog(
    "脚本已启动",
    location.href,
    `fetch=${fetchHooked ? "已挂钩" : "未挂钩（XHR 仍可用）"}`
  );
})();
