import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  TWEET_GRAPHQL_OPERATION_PATTERN,
  collectMediaItems,
  extractAuthor,
  extractMedia,
  findTweetResult,
  formatUTCDate,
  groupSlicedMedia,
  isEdgeContinuous,
  matchTweetId,
  meanAbsChannelDiff,
  normalizeTweetResult,
  originalMediaURL,
  panoramaLayout,
  parseTwitterDate,
  prettifyResponseText,
  renderDocument,
  serializeJSON,
  serializeJSONPretty,
  tweetCreatedAt,
  tweetIdOf,
  tweetText,
  tweetTranslation,
} from '../../src/x.com/capture-lib.ts';
import type { ImageEntry, MediaItem } from '../../src/x.com/capture-lib.ts';

/** 构造符合真实 TweetDetail 结构的推文对象（字段路径依据 docs/x-tweet-detail-graphql-fields.md） */
function tweetResult(): Record<string, unknown> {
  return {
    __typename: 'Tweet',
    rest_id: '1915351258162250129',
    core: {
      user_results: {
        result: {
          core: { name: 'nanata', screen_name: 'Nanata0418' },
          rest_id: '972267391802662912',
        },
      },
    },
    legacy: {
      created_at: 'Thu Apr 24 10:25:00 +0000 2025',
      full_text: 'day41 https://t.co/JHWgG68RHe',
      id_str: '1915351258162250129',
      extended_entities: {
        media: [
          {
            media_key: '3_1915351241234014213',
            media_url_https: 'https://pbs.twimg.com/media/GpSxzlHbYAUBbsv.jpg',
            type: 'photo',
            display_url: 'pic.x.com/HyV5137sLO',
            original_info: { width: 732, height: 1486 },
          },
        ],
      },
    },
  };
}

function legacyOf(tweet: Record<string, unknown>): Record<string, unknown> {
  return tweet.legacy as Record<string, unknown>;
}

/** 构造 TweetDetail 响应：instructions 按 TimelineAddEntries 承载焦点推文 */
function tweetDetailFixture(): unknown {
  return {
    data: {
      threaded_conversation_with_injections_v2: {
        instructions: [
          {
            type: 'TimelineAddEntries',
            entries: [
              {
                entryId: 'tweet-1915351258162250129',
                content: {
                  itemContent: {
                    tweet_results: {
                      result: tweetResult(),
                    },
                  },
                },
              },
            ],
          },
        ],
      },
    },
  };
}

test('URL 判定', () => {
  assert.equal(
    matchTweetId('/Nanata0418/status/1915351258162250129'),
    '1915351258162250129'
  );
  assert.equal(
    matchTweetId('/Nanata0418/status/1915351258162250129/photo/1'),
    '1915351258162250129'
  );
  assert.equal(
    matchTweetId('/i/status/1915351258162250129'),
    '1915351258162250129'
  );
  assert.equal(matchTweetId('/home'), undefined);
  assert.equal(matchTweetId('/Nanata0418/status/abc'), undefined);
});

test('GraphQL 操作名匹配（queryId 轮换，只按操作名）', () => {
  const op = (url: string): string | undefined =>
    TWEET_GRAPHQL_OPERATION_PATTERN.exec(url)?.[1];
  assert.equal(
    op(
      'https://x.com/i/api/graphql/8sK2MBRZY9z-fgmdNpR3LA/TweetDetail?variables={}'
    ),
    'TweetDetail'
  );
  assert.equal(
    op(
      'https://x.com/i/api/graphql/snmujSvB_9WXyd8yjvZ24Q/TweetResultByRestId?variables={}'
    ),
    'TweetResultByRestId'
  );
  assert.equal(
    op('https://x.com/i/api/graphql/abc/HomeTimeline?variables={}'),
    undefined
  );
  assert.equal(
    op('https://x.com/i/api/graphql/abc/TweetResultsByRestIds?variables={}'),
    undefined
  );
});

test('TweetDetail 提取焦点推文', () => {
  const fixture = tweetDetailFixture();
  const tweet = findTweetResult(fixture, 'TweetDetail', '1915351258162250129');
  assert.ok(tweet);
  assert.equal(tweetIdOf(tweet!), '1915351258162250129');
  assert.equal(findTweetResult(fixture, 'TweetDetail', '999999'), undefined);
});

test('TweetResultByRestId 提取', () => {
  const data = { data: { tweetResult: { result: tweetResult() } } };
  const tweet = findTweetResult(
    data,
    'TweetResultByRestId',
    '1915351258162250129'
  );
  assert.ok(tweet);
  assert.equal(tweetIdOf(tweet!), '1915351258162250129');
  assert.equal(
    findTweetResult(data, 'TweetResultByRestId', '999999'),
    undefined
  );
});

test('__typename 分支', () => {
  const tweet = tweetResult();
  assert.equal(normalizeTweetResult(tweet), tweet);
  assert.equal(
    normalizeTweetResult({ __typename: 'TweetWithVisibilityResults', tweet }),
    tweet
  );
  assert.equal(
    normalizeTweetResult({ __typename: 'TweetTombstone' }),
    undefined
  );
  assert.equal(
    normalizeTweetResult({ __typename: 'TweetUnavailable' }),
    undefined
  );
  assert.equal(normalizeTweetResult(undefined), undefined);
});

test('作者 / 正文 / 时间', () => {
  const tweet = tweetResult();
  assert.deepEqual(extractAuthor(tweet), {
    name: 'nanata',
    screenName: 'Nanata0418',
  });
  assert.equal(tweetText(tweet), 'day41 https://t.co/JHWgG68RHe');
  const created = tweetCreatedAt(tweet);
  assert.equal(created?.toISOString(), '2025-04-24T10:25:00.000Z');
  assert.equal(formatUTCDate(created!), '2025-04-24');
});

test('X 自带翻译提取', () => {
  const translated = {
    ...tweetResult(),
    grok_translated_post_with_availability: {
      is_available: true,
      data: {
        destination_language: 'zh',
        source_language: 'ko',
        translation: '按人气排序',
      },
    },
  };
  assert.deepEqual(tweetTranslation(translated), {
    translation: '按人气排序',
    sourceLanguage: 'ko',
    destinationLanguage: 'zh',
  });
  assert.equal(tweetTranslation(tweetResult()), undefined, '无翻译字段');
  assert.equal(
    tweetTranslation({
      ...tweetResult(),
      grok_translated_post_with_availability: { is_available: false },
    }),
    undefined,
    '翻译不可用'
  );
});

test('HTML 支持切换翻译', () => {
  const tweet = {
    ...tweetResult(),
    grok_translated_post_with_availability: {
      is_available: true,
      data: {
        destination_language: 'zh',
        source_language: 'ko',
        translation: '按人气排序 </script>',
      },
    },
  };
  const html = renderDocument(tweet, '{}', {});
  assert.ok(html.includes('capture-translate-label'), '译文语言标识');
  assert.ok(html.includes('翻译（ko → zh）'), '标识含语言');
  assert.ok(html.includes('day41'), '原文同时显示');
  assert.ok(html.includes('按人气排序'), '译文同时显示');
  assert.equal(html.includes('capture-translate-toggle'), false, '无切换按钮');
  assert.ok(html.includes('&lt;/script&gt;'), '译文被 HTML 转义');
});

test('时间解析（含非法输入）', () => {
  assert.equal(
    parseTwitterDate('Thu Apr 24 10:25:00 +0000 2025')?.toISOString(),
    '2025-04-24T10:25:00.000Z'
  );
  assert.equal(parseTwitterDate('not a date'), undefined);
  assert.equal(parseTwitterDate(undefined), undefined);
});

test('媒体提取与原图 URL 改写', () => {
  const media = extractMedia(tweetResult());
  assert.equal(media.length, 1);
  assert.equal(media[0]!.mediaKey, '3_1915351241234014213');
  assert.equal(
    media[0]!.url,
    'https://pbs.twimg.com/media/GpSxzlHbYAUBbsv?format=jpg&name=orig'
  );
  assert.equal(
    originalMediaURL(
      'https://pbs.twimg.com/ext_tw_video_thumb/2014393938984022016/pu/img/abc.jpg',
      'video'
    ),
    'https://pbs.twimg.com/ext_tw_video_thumb/2014393938984022016/pu/img/abc.jpg:orig'
  );
});

test('引用推文作为嵌套记录', () => {
  const quoted = {
    ...tweetResult(),
    rest_id: '111',
    legacy: {
      ...legacyOf(tweetResult()),
      full_text: 'quoted',
      extended_entities: {
        media: [
          {
            media_key: '3_222',
            media_url_https: 'https://pbs.twimg.com/media/XYZ.jpg',
            type: 'photo',
            display_url: 'pic.x.com/quoted',
            original_info: { width: 800, height: 800 },
          },
        ],
      },
    },
  };
  const tweet = { ...tweetResult(), quoted_status_result: { result: quoted } };
  assert.equal(collectMediaItems(tweet).length, 2);
  const html = renderDocument(tweet, '{}', {});
  assert.ok(html.includes('capture-quoted'));
});

test('JSON 转义（`</` -> `<\\/`）', () => {
  assert.equal(serializeJSON({ a: '</script>' }), '{"a":"<\\/script>"}');
  assert.equal(JSON.parse(serializeJSON({ a: '</script>' })).a, '</script>');
});

test('多行 JSON 序列化（便于调试）', () => {
  assert.ok(serializeJSONPretty({ a: 1, b: { c: 2 } }).includes('\n  "a"'));
  assert.ok(serializeJSONPretty({ a: '</script>' }).includes('<\\/script>'));
  assert.equal(prettifyResponseText('{"a":1}'), '{\n  "a": 1\n}');
  assert.equal(prettifyResponseText('not json'), 'not json');
});

test('HTML 产物三层结构', () => {
  const tweet = tweetResult();
  const data = tweetDetailFixture();
  const rawResponse = JSON.stringify(data);
  const images: Record<string, ImageEntry> = {
    '3_1915351241234014213': {
      url: 'https://pbs.twimg.com/media/GpSxzlHbYAUBbsv?format=jpg&name=orig',
      data: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
    },
  };
  const html = renderDocument(tweet, rawResponse, images);

  // 私有数据层：raw 与 images 两个 JSON 块
  const rawMatch = html.match(
    /<script type="application\/json" id="twitter-capture-raw">\n([\s\S]*?)\n<\/script>/
  );
  const imgMatch = html.match(
    /<script type="application\/json" id="twitter-capture-images">\n([\s\S]*?)\n<\/script>/
  );
  assert.ok(rawMatch);
  assert.ok(imgMatch);
  assert.equal(
    JSON.stringify(JSON.parse(rawMatch[1]!)),
    JSON.stringify(data),
    'raw 块是完整响应原文'
  );
  assert.ok(rawMatch[1]!.includes('\n'), 'raw 块为多行输出');
  assert.ok(imgMatch[1]!.includes('\n'), 'images 块为多行输出');
  assert.equal(
    imgMatch[1]!.includes('</script>'),
    false,
    'images 块无裸 </script>'
  );
  const imgJSON = JSON.parse(imgMatch[1]!) as Record<
    string,
    { url: string; data: string }
  >;
  assert.equal(
    imgJSON['3_1915351241234014213']!.url.includes('format=jpg&name=orig'),
    true
  );
  assert.equal(
    imgJSON['3_1915351241234014213']!.data.startsWith(
      'data:image/jpeg;base64,'
    ),
    true
  );

  // 公开标准层：ld+json 与 OG meta
  const ldMatch = html.match(
    /<script type="application\/ld\+json">\n([\s\S]*?)\n<\/script>/
  );
  assert.ok(ldMatch);
  const ldJSON = JSON.parse(ldMatch[1]!) as Record<string, unknown>;
  assert.equal(ldJSON['@type'], 'SocialMediaPosting');
  assert.equal(
    ldJSON.url,
    'https://x.com/Nanata0418/status/1915351258162250129'
  );
  assert.equal(ldJSON.datePublished, '2025-04-24T10:25:00.000Z');
  assert.equal((ldJSON.author as { name: string }).name, 'nanata');
  assert.deepEqual(ldJSON.image, [
    'https://pbs.twimg.com/media/GpSxzlHbYAUBbsv?format=jpg&name=orig',
  ]);
  assert.ok(html.includes('og:url'));
  assert.ok(html.includes('og:title'));
  assert.ok(html.includes('og:image'));

  // 可见正文层：文本、作者、时间、自定义元素
  assert.ok(html.includes('day41'));
  assert.ok(html.includes('nanata'));
  assert.ok(html.includes('@Nanata0418'));
  assert.ok(html.includes('2025-04-24'));
  assert.ok(html.includes('<capture-image ref="3_1915351241234014213">'));
  assert.ok(
    html.includes("customElements.define('capture-image', CaptureImage)")
  );
  assert.ok(html.includes('class CaptureImage extends HTMLElement'));
});

test('恶意正文不破坏文档结构', () => {
  const tweet = {
    ...tweetResult(),
    legacy: {
      ...legacyOf(tweetResult()),
      full_text: 'safe <b>ok</b> </script><script>alert(1)</script> & x',
    },
  };
  const html = renderDocument(tweet, '{}', {});
  assert.ok(html.includes('&lt;/script&gt;'), '正文中的 </script> 被转义');
  const rawMatch = html.match(
    /<script type="application\/json" id="twitter-capture-raw">\n([\s\S]*?)\n<\/script>/
  );
  assert.ok(rawMatch);
  assert.deepEqual(JSON.parse(rawMatch[1]!), {}, 'raw 块仍为合法 JSON');
});

test('无图片推文', () => {
  const tweet = {
    ...tweetResult(),
    legacy: { ...legacyOf(tweetResult()), extended_entities: { media: [] } },
  };
  const html = renderDocument(tweet, '{}', {});
  assert.ok(html.includes('capture-text'));
  assert.equal(html.includes('<div class="capture-media">'), false);
  assert.ok(html.includes('twitter-capture-raw'));
});

test('分片全景图检测：同一短链且尺寸一致才成组', () => {
  const base: MediaItem = {
    mediaKey: '3_1',
    url: 'https://pbs.twimg.com/media/A.jpg',
    type: 'photo',
    width: 732,
    height: 1486,
    displayUrl: 'pic.x.com/abc',
  };
  const items: MediaItem[] = [
    base,
    { ...base, mediaKey: '3_2', url: 'https://pbs.twimg.com/media/B.jpg' },
    // 不同短链：真实多图推文的另一张图，不成组
    { ...base, mediaKey: '3_3', displayUrl: 'pic.x.com/other' },
    // 尺寸不同：不成组
    { ...base, mediaKey: '3_4', width: 800 },
    // 缺尺寸信息：不成组
    {
      mediaKey: '3_5',
      url: 'https://pbs.twimg.com/media/E.jpg',
      type: 'photo',
    },
  ];
  const groups = groupSlicedMedia(items);
  assert.equal(groups.length, 1);
  assert.deepEqual(
    groups[0]!.map((i) => i.mediaKey),
    ['3_1', '3_2']
  );
  // 尺寸差 1px 内仍成组（切分/重编码可能产生 1px 偏差）
  const nearGroup = groupSlicedMedia([
    base,
    { ...base, mediaKey: '3_6', width: 733 },
  ]);
  assert.equal(nearGroup.length, 1);
  assert.equal(nearGroup[0]!.length, 2);
  // 索引不相连的同短链媒体不成组（不会尝试拼合不相邻的分片）
  const separated = groupSlicedMedia([
    base,
    { ...base, mediaKey: '3_7', displayUrl: 'pic.x.com/other' },
    { ...base, mediaKey: '3_8' },
  ]);
  assert.equal(separated.length, 0);
});

test('分片拼接布局：竖幅横向拼接 / 横幅纵向拼接', () => {
  const portrait = (mediaKey: string, url: string): MediaItem => ({
    mediaKey,
    url,
    type: 'photo',
    width: 732,
    height: 1486,
    displayUrl: 'pic.x.com/abc',
  });
  assert.deepEqual(
    panoramaLayout([portrait('3_1', 'a'), portrait('3_2', 'b')]),
    {
      width: 1464,
      height: 1486,
      direction: 'horizontal',
      places: [
        { x: 0, y: 0, width: 732, height: 1486 },
        { x: 732, y: 0, width: 732, height: 1486 },
      ],
    }
  );
  const landscape = (mediaKey: string, url: string): MediaItem => ({
    mediaKey,
    url,
    type: 'photo',
    width: 1486,
    height: 732,
    displayUrl: 'pic.x.com/tall',
  });
  assert.deepEqual(
    panoramaLayout([landscape('3_1', 'a'), landscape('3_2', 'b')]),
    {
      width: 1486,
      height: 1464,
      direction: 'vertical',
      places: [
        { x: 0, y: 0, width: 1486, height: 732 },
        { x: 0, y: 732, width: 1486, height: 732 },
      ],
    }
  );
  assert.equal(panoramaLayout([]), undefined);
});

test('边缘像素一致性判定', () => {
  const solid = (value: number, pixels = 4): Uint8ClampedArray => {
    const arr = new Uint8ClampedArray(pixels * 4);
    for (let i = 0; i < arr.length; i += 4) {
      arr[i] = value;
      arr[i + 1] = value;
      arr[i + 2] = value;
      arr[i + 3] = 255;
    }
    return arr;
  };
  // 平均通道差
  assert.equal(meanAbsChannelDiff(solid(100), solid(102)), 2);
  assert.equal(meanAbsChannelDiff(solid(100), solid(200)), 100);
  assert.equal(meanAbsChannelDiff(solid(100), solid(100, 2)), Infinity);
  // 跨片差异接近片内基线（真实分片）→ 连续
  assert.equal(isEdgeContinuous(3, 2), true);
  // 跨片差异远大于基线（无关图片）→ 不连续
  assert.equal(isEdgeContinuous(60, 5), false);
  // 高频图片（基线高）下，较大差异仍可接受
  assert.equal(isEdgeContinuous(30, 20), true);
  assert.equal(isEdgeContinuous(50, 20), false);
  // 非法输入
  assert.equal(isEdgeContinuous(Infinity, 5), false);
  assert.equal(isEdgeContinuous(5, NaN), false);
});

test('分片组在正文只渲染一张拼合图', () => {
  const tweet = {
    ...tweetResult(),
    legacy: {
      ...legacyOf(tweetResult()),
      extended_entities: {
        media: [
          {
            media_key: '3_2099543844383866880',
            media_url_https: 'https://pbs.twimg.com/media/HSMUAKrbwAAdUcP.jpg',
            type: 'photo',
            display_url: 'pic.x.com/HyV5137sLO',
            original_info: { width: 732, height: 1486 },
          },
          {
            media_key: '3_2099543842462785536',
            media_url_https: 'https://pbs.twimg.com/media/HSMUADhaYAArvPV.jpg',
            type: 'photo',
            display_url: 'pic.x.com/HyV5137sLO',
            original_info: { width: 732, height: 1486 },
          },
        ],
      },
    },
  };
  const media = extractMedia(tweet);
  const groups = groupSlicedMedia(media);
  assert.equal(groups.length, 1);
  assert.equal(groups[0]!.length, 2);
  const groupKey = groups[0]![0]!.displayUrl!;
  const groupRefs = new Map<string, string>();
  for (const item of groups[0]!) {
    groupRefs.set(item.mediaKey, groupKey);
  }
  const images: Record<string, ImageEntry> = {
    '3_2099543844383866880': {
      url: 'https://pbs.twimg.com/media/HSMUAKrbwAAdUcP?format=jpg&name=orig',
    },
    '3_2099543842462785536': {
      url: 'https://pbs.twimg.com/media/HSMUADhaYAArvPV?format=jpg&name=orig',
    },
    [groupKey]: {
      data: 'data:image/avif;base64,AAAAIGZ0eXBhdmlm',
    },
  };
  const html = renderDocument(tweet, '{}', images, groupRefs);
  const refs = [...html.matchAll(/<capture-image ref="([^"]+)"/g)].map(
    (m) => m[1]
  );
  assert.deepEqual(refs, [groupKey]);
  assert.equal(
    images[groupKey]!.url,
    undefined,
    '拼合图省略 url，避免下游误抓'
  );
  assert.ok(images[groupKey]!.data !== undefined);
});
