# x.com tweet detail page: SSR state blob & TweetDetail XHR — evidence report

Research date: 2026 (session context). All claims below are backed by a source URL.
No local files were used as sources.

---

## Q1. Does x.com's initial HTML embed a state blob in a `<script>` tag? What is it?

**VERDICT: YES — the variable is `window.__INITIAL_STATE__`.**

It is **not** `__NEXT_DATA__`, **not** `window.__reactRouterContext`, and **not** a
`<script type="application/json">` blob. It is a plain JS **assignment** inside an
inline `<script nonce="...">` tag. A second assignment, `window.__META_DATA__`, lives in
the **same** inline script tag. A third, `window.__SCRIPTS_LOADED__ = {}`, follows in the
next inline tag.

### Evidence 1 — real archived x/twitter.com HTML (verified by direct inspection)

Source: <https://github.com/yuxi-liu-wired/cyc-archive/blob/main/websites/twitter.com/20201109025312/cyc_ai/index.html>

That file is a saved `twitter.com` page (`20201109025312` = Wayback timestamp). Inspecting
the raw HTML shows exactly one inline `<script nonce="...">` carrying the state, and its
literal content is:

```html
<script nonce="M2FjNTlmZDItYjk4Ny00MzFiLTkxMDAtNjMxY2FiMjkzZjVj">
window.__INITIAL_STATE__ = {"optimist":[],"featureSwitch":{"config":{"2fa_multikey_management_enabled":{"value":false}, ...
...
window.__META_DATA__ = {"env":"prod","isFromDynamicRenderer":false,"isLoggedIn":false,"isRTL":false,"hasMultiAccountCookie":false,"uaParserTags":["m2","rweb","msw"],"serverDate":1604890392490,"sha":"f8d241ad283649ee342415599c33f1d077ae0a41"};
</script>
<script type="text/javascript" charset="utf-8" nonce="M2FjNTlmZDItYjk4Ny00MzFiLTkxMDAtNjMxY2FiMjkzZjVj">
  window.__SCRIPTS_LOADED__ = {};
```

Counts in that file: 7 `<script` tags total, 1 occurrence of `__INITIAL_STATE__`,
1 occurrence of `__META_DATA__`. No `__NEXT_DATA__`, no `type="application/json"`.

### Evidence 2 — a maintained scraper parses exactly these two names

Source: <https://github.com/fa0311/TwitterInternalAPIDocument/blob/master/generator.py>

```python
initial_state=search_js_reg(parsed_script_list,"window.__INITIAL_STATE__=")[0].after
initial_output=json.loads(json_parser(initial_state))
meta_data=search_js(parsed_script_list,";window.__META_DATA__=")[0].after
meta_output=json.loads(json_parser(meta_data))
```

Note it matches the literal strings `"window.__INITIAL_STATE__="` and
`";window.__META_DATA__="` — i.e. JS assignments, and the output is passed through
`json_parser()` (a JS-object-to-JSON converter), not a plain `json.loads` of a JSON script
tag. Supporting regex for the inline tag shape, from the same repo:
<https://github.com/fa0311/TwitterInternalAPIDocument/blob/master/lib/twitter.py>

```python
reg_script='<script type="text/javascript" charset="utf-8" nonce="{nonce}">{any}</script>'
```

### Evidence 3 — the parsed state is still published today

Source: <https://github.com/fa0311/TwitterInternalAPIDocument/blob/master/docs/json/InitialState.json>

This file is regenerated daily (per the repo README, develop branch, 21:00 UTC:
<https://github.com/fa0311/TwitterInternalAPIDocument>) from `window.__INITIAL_STATE__`,
and its top-level shape is a React-Query-style entity store:

```json
{
  "optimist": [],
  "entities": {
    "tweets": { "entities": {}, "errors": {}, "fetchStatus": {} },
    "users":  { "entities": { "2817995382": { ... } }, "errors": {},
                "fetchStatus": { "2817995382": "loaded", "home": "loading" } }
  },
  "featureSwitch": { "defaultConfig": { ... } }
}
```

### Evidence 4 — a currently maintained userscript hooks the same variable

Source: <https://github.com/Saganaki22/AgebypassX>

> "AgebypassX installs an accessor on: `window.__INITIAL_STATE__`. When X assigns its
> initial application state, the object is patched before the frontend consumes it."

Its interception layers are listed as `window.__INITIAL_STATE__`, `Object.assign`,
`JSON.parse`, and `Response.prototype.json`. The README also states (relevant to Q3):

> "Modern X code frequently uses: `fetch(...)` followed by `response.json()`.
> Browser-native `Response.json()` parsing can bypass an overridden page-level `JSON.parse`."

---

## Q2. Is the tweet body/content visible in the raw HTML source of a status page?

**VERDICT: NO — the tweet body is not in the raw HTML; it is client-rendered.**

### Evidence 1 — the embedded state store has an EMPTY tweet table

From the same archived raw HTML as Q1, the `__INITIAL_STATE__` blob contains:

```json
"entities":{"broadcasts":{...},"cards":{...},"tweets":{"entities":{},"errors":{},"fetchStatus":{}}, ...
```

`tweets.entities` is `{}` — no tweet objects, and the substring `full_text` does **not**
occur anywhere in the embedded blob. The blob is 16,644 characters of feature switches,
settings, and empty entity tables.

Source: <https://github.com/yuxi-liu-wired/cyc-archive/blob/main/websites/twitter.com/20201109025312/cyc_ai/index.html>

### Evidence 2 — Stack Overflow states X uses CSR, so view-source shows nothing relevant

Source: <https://stackoverflow.com/questions/62526483/twitter-website-doesnt-have-open-graph-tags>

Surfaced quote: "Twitter uses client-side-rendering (CSR) to generate HTML in the browser.
Viewing the source directly will not show any of the relevant..." (the question is about
`og:title` / `og:description` missing from view-source on a tweet page).

### Evidence 3 — X's own developer forum: tweet-page tags are "only populated by Javascript"

Source: <https://devcommunity.x.com/t/twitter-removed-opengraph-tags-from-server-rendered-tweet-page/138473>

> "Retrieving the HTML document of a single tweet, let's say
> `https://twitter.com/TwitterSupport/status/1267105441278033920` would give back a
> response that included in the document `<head>` all the usual OpenGraph tags ... Recently,
> we found that on responses we only see the `og:site_name` being set, and other tags are
> only populated by Javascript."

A related thread confirms the same symptom three years later:
<https://devcommunity.x.com/t/no-opengraph-tags-when-fetching-html-of-a-tweet/188217>

### Evidence 4 — the HTML's only useful payload is the JS bundle + queryId, not the content

Source: <https://github.com/yt-dlp/yt-dlp/issues/17105>

The proposed (and currently used) extraction path is:

> "fetch the tweet URL — extract the preload script URL (`<link ... rel="preload"
> as="script" ... href="...">`) for example `"main.7e48596a.js"` — fetch
> `https://abs.twimg.com/responsive-web/client-web/main.7e48596a.js` — extract the queryId,
> for example `"RguQ9yvaXf-EETmDagsLzg"` — fetch
> `https://x.com/i/api/graphql/{queryId}/TweetDetail?variables=...`"

i.e. the page HTML yields the bundle and the operation id; the tweet text arrives from
GraphQL. (`yt-dlp` itself fetches `TweetResultByRestId` for the tweet, per the verbose
output in that issue.)

### Evidence 5 — reading a post permalink requires waiting for the DOM to render

Source: <https://github.com/lockdown-systems/cyd/blob/main/docs/x-capture/element-inventory-20260914.md>

In the "Saving a post permalink" table, the step to obtain the post is
"Wait for the post | `article[tabindex="-1"]`" — i.e. the post must be rendered by JS;
there is no HTML text to parse.

### Caveat (not fully verified)

There is a long-standing claim that X whitelists known crawler user-agents (e.g.
`Twitterbot`) and serves them a **separate, server-side-rendered** HTML variant containing
OpenGraph tags. A search snippet attributed to the same Stack Overflow question references
"Bypassing the User-Agent whitelist to receive server-side-rendered (SSR) HTML. Various
prominent web-crawlers are whitelisted by Twitter to...". I could **not** retrieve the full
text of that answer to quote it precisely, so treat crawler-UA SSR as **unconfirmed** here.
For a normal browser user-agent, the verdict above (NO) holds.

---

## Q3. On CLIENT-SIDE routing (clicking a tweet in the timeline), is a NEW TweetDetail request issued?

**VERDICT: It issues a NEW request. No evidence of serving the view from an existing client store.**

### Evidence 1 — click → GET TweetDetail, with the *originating route* carried as a variable

Source: <https://trekhleb.dev/blog/2024/api-design-x-home-timeline/>

> "Once the user would like to see the tweet detail page (i.e. to see the thread of
> comments/tweets), **the user clicks on the tweet and the `GET` request to the following
> endpoint is performed**:
> `GET https://x.com/i/api/graphql/{query-id}/TweetDetail?variables={"focalTweetId":"1867231621095096312","referrer":"home","controller_data":"DACABBSQ","rankingMode":"Relevance","includePromotedContent":true,"withCommunity":true}&features={...}`"

The `referrer` field is literally the route the user navigated *from* (`"home"`). A value
that varies by navigation origin only has meaning if the request is issued per navigation —
it is not a value that could be replayed from a shared cache entry.

The same article notes the home timeline does **not** prefetch conversations:

> "The 'comments' ... for each 'tweet' in the home timeline are not fetched at all. To see
> the tweet thread the user must click on the tweet to see its detailed view. The tweet
> thread will be fetched by calling the `TweetDetail` endpoint."

### Evidence 2 — a browser extension exists precisely because these requests fire as you browse

Source: <https://github.com/prinsss/twitter-web-exporter>

> "The script itself does not send any request to Twitter API. **It installs an network
> interceptor to capture the response of GraphQL request that initiated by the Twitter web
> app.** The script then parses the response and extracts data from it."

Its capture target for the detail view:
<https://github.com/prinsss/twitter-web-exporter/blob/main/src/modules/tweet-detail/api.ts>

```ts
// https://twitter.com/i/api/graphql/8sK2MBRZY9z-fgmdNpR3LA/TweetDetail
// https://twitter.com/i/api/graphql/a8M2LqEB5TwbW_eDrsmcDA/ModeratedTimeline
export const TweetDetailInterceptor: Interceptor = (req, res, ext) => {
  const isTweetDetail = /\/graphql\/.+\/TweetDetail/.test(req.url);
  const isModeratedTimeline = /\/graphql\/.+\/ModeratedTimeline/.test(req.url);
```

and it is an **XHR-only** hook (fetch is *not* hooked by this project) —
<https://github.com/prinsss/twitter-web-exporter/blob/main/src/core/extensions/manager.ts>:

```ts
globalObject.XMLHttpRequest.prototype.open = function (method: string, url: string) {
  this.addEventListener('load', () => { ... func({method,url}, this, ext); ... });
  xhrOpen.apply(this, arguments);
};
```

with the interceptor typed against `XMLHttpRequest`
(<https://github.com/prinsss/twitter-web-exporter/blob/main/src/core/extensions/extension.ts>:
`response: XMLHttpRequest`). This is direct evidence that **`TweetDetail` on x.com today
goes over XHR**, not `fetch` — otherwise this widely used (2.7k★) extension would capture
nothing.

Note the `?` after `TweetDetail` in "Control Panel for Twitter", which patches the very
`TweetDetail` XHR URL to reorder replies — further confirming the detail view issues a
`/TweetDetail?` XHR: <https://greasyfork.org/en/scripts/387773-control-panel-for-twitter/code>

```js
const XMLHttpRequest_open = XMLHttpRequest.prototype.open
XMLHttpRequest.prototype.open = function(method, url) {
  if (config.sortReplies != 'relevant' && !userSortedReplies && url.includes('/TweetDetail?')) { ... }
```

### Evidence 3 — 2026 capture: opening a post permalink fires BOTH detail operations

Source: <https://github.com/lockdown-systems/cyd/blob/main/docs/x-capture/findings-20260914.md>

| Surface | Route | Operation | Identifier |
|---|---|---|---|
| One post | `/<username>/status/<id>` | `TweetDetail` | `FyR-GrebyjdkRoW1z6uCgQ` |
| One post | — | `TweetResultByRestId` | `snmujSvB_9WXyd8yjvZ24Q` |

The same document records that these requests are captured from a proxy as the client
issues them, and that each carries a navigation-dependent `referrer`.

### Evidence 4 — opening a status URL needs a real browser to produce the request

Source: <https://scrapfly.io/blog/posts/how-to-scrape-twitter>

> "You scrape an X post by loading its status URL and capturing the `TweetResultByRestId`
> GraphQL response. The same browser approach applies, with a different selector and filter."
> … `wait_for_selector="[data-testid='tweet']"` then filter `xhr_calls` for
> `TweetResultByRestId`.

Same pattern in <https://apify.com/api_heros/twitter-scraper>:
> "Open `https://x.com` (logged in) → DevTools → **Network** tab. Filter by `TweetDetail`,
> **open any tweet**. Right-click the `TweetDetail` request → **Copy URL**."

### Honest limitation on Q3

I found **no** source that explicitly states "the app checks the react-query cache and
reuses it instead of issuing a request." The `entities` / `fetchStatus` shape in
`InitialState.json` is consistent with a React-Query-style store, and `fetchStatus` values
like `"loaded"` / `"loading"` exist — but no source demonstrates a cache-hit short-circuit
for `TweetDetail`. Every piece of observed evidence shows a request being issued on
navigation. So: **the request is issued; whether a *subsequent* re-visit of the *same*
tweet within one SPA session is served from cache is 未找到可靠证据.**

---

## Summary table

| # | Question | Verdict | Primary source |
|---|---|---|---|
| 1 | State blob in `<script>`? | **YES — `window.__INITIAL_STATE__`** (JS assignment in inline `<script nonce>`; also `window.__META_DATA__` in the same tag). Not `__NEXT_DATA__`, not `__reactRouterContext`, not `type="application/json"`. | [Archived raw twitter.com HTML](https://github.com/yuxi-liu-wired/cyc-archive/blob/main/websites/twitter.com/20201109025312/cyc_ai/index.html) · [generator.py](https://github.com/fa0311/TwitterInternalAPIDocument/blob/master/generator.py) |
| 2 | Tweet body in raw HTML? | **NO — client-rendered.** `__INITIAL_STATE__.entities.tweets.entities` is `{}`; no `full_text` in the blob. | [Archived HTML](https://github.com/yuxi-liu-wired/cyc-archive/blob/main/websites/twitter.com/20201109025312/cyc_ai/index.html) · [X dev forum](https://devcommunity.x.com/t/twitter-removed-opengraph-tags-from-server-rendered-tweet-page/138473) · [Stack Overflow](https://stackoverflow.com/questions/62526483/twitter-website-doesnt-have-open-graph-tags) |
| 3 | New `TweetDetail` XHR on client-side navigation? | **YES — a new XHR is issued.** `referrer` carries the origin route; extensions capture it live. | [trekhleb API teardown](https://trekhleb.dev/blog/2024/api-design-x-home-timeline/) · [twitter-web-exporter manager.ts](https://github.com/prinsss/twitter-web-exporter/blob/main/src/core/extensions/manager.ts) · [cyd 2026 findings](https://github.com/lockdown-systems/cyd/blob/main/docs/x-capture/findings-20260914.md) |

## Explicitly not found (未找到可靠证据)

1. **未找到可靠证据** that crawler user-agents (e.g. `Twitterbot`) receive a
   server-rendered tweet-body HTML variant from x.com. Only an unverifiable search snippet
   was found.
2. **未找到可靠证据** on whether a *repeat* visit to the *same* tweet inside one SPA
   session is served from the react-query cache without a network request.
3. **未找到可靠证据** that a `<script id="__NEXT_DATA__">` or `window.__reactRouterContext`
   is ever used by x.com. Those candidates appear only on unrelated sites (Shopify,
   CheckPhish snapshots) in search results — they are **not** x.com's mechanism.
4. **未找到可靠证据** distinguishing "full page load" vs "client-side navigation" in terms
   of *which* operation fires (`TweetDetail` vs `TweetResultByRestId`). The 2026 cyd capture
   lists both against the same `/<username>/status/<id>` route without saying which one a
   hard load triggers.
