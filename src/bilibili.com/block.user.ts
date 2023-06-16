// ==UserScript==
// @name     B站用户屏蔽
// @namespace https://github.com/NateScarlet/Scripts/tree/master/user-script
// @description 避免看到指定用户上传的视频，在用户个人主页和视频左上角会多出屏蔽按钮。
// @grant    GM.getValue
// @grant    GM.setValue
// @grant    GM.deleteValue
// @include	 https://search.bilibili.com/*
// @include	 https://space.bilibili.com/*
// @include	 https://www.bilibili.com/*
// @run-at   document-start
// ==/UserScript==

// spell-checker: word bili bilibili upname datetime

import compare from "@/utils/compare";
import obtainHTMLElement from "@/utils/obtainHTMLElementByID";
import useGMValue from "@/utils/useGMValue";
import usePolling from "@/utils/usePolling";
import { render, html } from "lit-html";
import { mdiAccountCancelOutline } from "@mdi/js";
import setHTMLElementDisplayHidden from "@/utils/setHTMLElementDisplayHidden";
import obtainHTMLElementByDataKey from "@/utils/obtainHTMLElementByDataKey";
import injectStyle from "@/utils/injectStyle";
import castPlainObject from "@/utils/castPlainObject";
import getElementSelector from "@/utils/getElementSelector";
import evalInContentScope from "@/utils/evalInContentScope";

export {};

declare global {
  interface HTMLElement {
    __vue__?: { _props?: Record<string, unknown> };
  }
}

interface BlockedUser {
  name: string;
  blockedAt: number;
}

const blockedUsers = useGMValue(
  "blockedUsers@206ceed9-b514-4902-ad70-aa621fed5cd4",
  {} as Record<string, BlockedUser | true | undefined>
);

async function migrateV1() {
  const key = "blockedUserIDs@7ced1613-89d7-4754-8989-2ad0d7cfa9db";
  const oldValue = await GM.getValue(key);
  if (!oldValue) {
    return;
  }
  const newValue = { ...blockedUsers.value };
  (JSON.parse(String(oldValue)) as string[]).forEach((i) => {
    newValue[i] = true;
  });
  blockedUsers.value = newValue;
  await GM.deleteValue(key);
}

function renderActions(userID: string) {
  const parent = document.querySelector(".h-action");
  if (!parent) {
    return;
  }

  const container = obtainHTMLElement(
    "div",
    "7ced1613-89d7-4754-8989-2ad0d7cfa9db",
    {
      onCreate: (el) => {
        el.style.display = "inline";
        parent.append(el, parent.lastChild!);
      },
    }
  );
  const isBlocked = !!blockedUsers.value[userID];

  render(
    html`
      <span
        class="h-f-btn"
        @click=${(e: MouseEvent) => {
          e.stopPropagation();
          const isBlocked = !!blockedUsers.value[userID];
          blockedUsers.value = {
            ...blockedUsers.value,
            [userID]: !isBlocked
              ? {
                  name: document.getElementById("h-name")?.innerText ?? "",
                  blockedAt: Date.now(),
                }
              : undefined,
          };
        }}
      >
        ${isBlocked ? "取消屏蔽" : "屏蔽"}
      </span>
    `,
    container
  );
}

function renderNav() {
  const parent = document.querySelector(".right-entry");
  if (!parent) {
    return;
  }
  const container = obtainHTMLElement(
    "li",
    "db7a644d-1c6c-4078-a9dc-991b15b68014",
    {
      onCreate: (el) => {
        el.classList.add("right-entry-item");
        parent.prepend(parent.firstChild!, el);
      },
    }
  );
  const count = Object.keys(blockedUsers.value).length;
  setHTMLElementDisplayHidden(container, count == 0);

  render(
    html`
<button
  type="button"
  class="right-entry__outside" 
  @click=${(e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(blockedUsersURL(), "_blank");
  }}
>
  <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg" class="right-entry-icon">
    <path fill-rule="evenodd" clip-rule="evenodd" d=${mdiAccountCancelOutline} fill="currentColor">
  </svg>
  <span class="right-entry-text">
    <span>屏蔽</span>
    <span>(${count})</span>
  </span>
</button>
`,
    container
  );
}

function parseUserURL(rawURL: string | null | undefined): string | undefined {
  if (!rawURL) {
    return;
  }
  const url = new URL(rawURL, window.location.href);
  switch (url.host) {
    case "space.bilibili.com": {
      const match = /^\/(\d+)\/?/.exec(url.pathname);
      if (!match) {
        return;
      }
      return match[1];
    }
    case "cm.bilibili.com": {
      return url.searchParams.get("space_mid") || undefined;
    }
  }
}

function parseVideoURL(rawURL: string | undefined) {
  if (!rawURL) {
    return;
  }
  const url = new URL(rawURL, window.location.href);
  if (url.host !== "www.bilibili.com") {
    return;
  }
  const match = /^\/video\//.exec(url.pathname);
  if (!match) {
    return;
  }
  return {};
}

function renderVideoList() {
  document.querySelectorAll<HTMLElement>(".bili-video-card").forEach((i) => {
    const rawURL = i
      .querySelector("a.bili-video-card__info--owner")
      ?.getAttribute("href");
    if (!rawURL) {
      return;
    }
    const userID = parseUserURL(rawURL);
    if (!userID) {
      return;
    }
    const isBlocked = !!blockedUsers.value[userID];
    let container = i;
    while (container.parentElement?.childElementCount === 1) {
      container = i.parentElement!;
    }

    setHTMLElementDisplayHidden(container, isBlocked);
    if (!isBlocked) {
      renderHoverButton(i.querySelector(".bili-video-card__image--wrap"), {
        id: userID,
        name:
          i
            .querySelector(".bili-video-card__info--author")
            ?.getAttribute("title") || userID,
      });
    }
  });
}

function renderVPopular() {
  document.querySelectorAll<HTMLElement>(".video-card").forEach((i) => {
    const selector = getElementSelector(i);
    const videoData = evalInContentScope(
      `document.querySelector(${JSON.stringify(
        selector
      )}).__vue__._props.videoData`
    );

    const { owner } = castPlainObject(videoData);
    const { mid, name } = castPlainObject(owner);
    if (typeof mid != "number" || typeof name !== "string") {
      return;
    }

    const userID = mid.toString();
    const isBlocked = !!blockedUsers.value[userID];
    setHTMLElementDisplayHidden(i, isBlocked);
    if (!isBlocked) {
      renderHoverButton(i.querySelector(".video-card__content"), {
        id: userID,
        name,
      });
    }
  });
}

function renderVPopularRankAll() {
  document.querySelectorAll<HTMLElement>(".rank-item").forEach((i) => {
    const userID = parseUserURL(
      i.querySelector(".up-name")?.parentElement?.getAttribute("href")
    );
    if (!userID) {
      return;
    }
    const name = i.querySelector(".up-name")?.textContent ?? "";

    const isBlocked = !!blockedUsers.value[userID];
    setHTMLElementDisplayHidden(i, isBlocked);
    if (!isBlocked) {
      renderHoverButton(i.querySelector(".img"), {
        id: userID,
        name,
      });
    }
  });
}

function renderHoverButton(
  parentNode: HTMLElement | null,
  user: { id: string; name: string }
) {
  if (!parentNode) {
    return;
  }
  const key = "a1161956-2be7-4796-9f1b-528707156b11";
  injectStyle(
    key,
    `\
[data-${key}]:hover .group-hover\\:opacity-100 {
  opacity: 100;
  transition: opacity 0.2s linear 0.2s;
}

[data-${key}] .opacity-0 {
  opacity: 0;
  transition: opacity 0.2s linear 0s;
}
`
  );
  const el = obtainHTMLElementByDataKey({
    tag: "div",
    key,
    parentNode,
    onDidCreate: (el) => {
      parentNode.setAttribute(`data-${key}`, "");
      parentNode.append(el);
    },
  });
  render(
    html`
<button
  type="button"
  class="opacity-0 group-hover:opacity-100" 
  title="屏蔽此用户"
  style="
    position: absolute;
    top: 8px;
    left: 8px;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    cursor: pointer;
    color: #fff;
    background-color: rgba(33,33,33,.8);
    z-index: 9;
    border: none;
"  @click=${(e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      blockedUsers.value = {
        ...blockedUsers.value,
        [user.id]: {
          name: user.name,
          blockedAt: Date.now(),
        },
      };
    }}
>
  <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d=${mdiAccountCancelOutline} fill="currentColor">
  </svg>
</button>
    `,
    el
  );
}

function renderVideoDetail() {
  const blockedTitles = new Set<string>();

  document
    .querySelectorAll<HTMLElement>(".video-page-card-small")
    .forEach((i) => {
      const rawURL = i.querySelector(".upname a")?.getAttribute("href");
      if (!rawURL) {
        return;
      }
      const userID = parseUserURL(rawURL);
      if (!userID) {
        return;
      }
      const isBlocked = !!blockedUsers.value[userID];
      if (isBlocked) {
        const title = i.querySelector(".title[title]")?.getAttribute("title");
        if (title) {
          blockedTitles.add(title);
        }
      }
      setHTMLElementDisplayHidden(i, isBlocked);
      if (!isBlocked) {
        renderHoverButton(i.querySelector(".pic-box"), {
          id: userID,
          name: i.querySelector(".upname .name")?.textContent || userID,
        });
      }
    });

  document
    .querySelectorAll<HTMLElement>(".bpx-player-ending-related-item")
    .forEach((i) => {
      const title = i.querySelector(
        ".bpx-player-ending-related-item-title"
      )?.textContent;
      if (!title) {
        return;
      }
      const isBlocked = blockedTitles.has(title);
      setHTMLElementDisplayHidden(i, isBlocked);
    });
}

function blockedUsersHTML() {
  const userIDs = Object.keys(blockedUsers.value);
  const now = new Date();
  function getData(id: string) {
    const value = blockedUsers.value[id];
    const { blockedAt: rawBlockedAt = 0, name = id } =
      typeof value === "boolean" ? {} : value ?? {};
    const blockedAt = new Date(rawBlockedAt);
    return {
      id,
      blockedAt,
      name,
      idAsNumber: Number.parseInt(id),
      isFallback: rawBlockedAt === 0,
    };
  }
  return [
    "<html>",
    "<head>",
    "<title>已屏蔽的用户</title>",
    `<script id="data" lang="application/json">
    ${JSON.stringify(blockedUsers.value, undefined, 2)}
    </script>`,
    "</head>",
    "<body>",
    "<div>",
    `  <h1>已屏蔽 ${userIDs.length} 用户</h1>`,
    `  <time datetime="${now.toISOString()}">${now.toLocaleString()}</time>`,
    "  <ul>",
    ...userIDs
      .map(getData)
      .sort((a, b) => {
        const dateCompare = compare(a.blockedAt, b.blockedAt);
        if (dateCompare !== 0) {
          return -dateCompare;
        }
        return compare(a.idAsNumber, b.idAsNumber);
      })
      .map(({ id, name, blockedAt, isFallback }) => {
        return [
          "<li>",
          `<a href="https://space.bilibili.com/${id}" target="_blank">${name}</a>`,
          ...(!isFallback
            ? [
                `<span>屏蔽于<time datetime="${blockedAt.toISOString()}">${blockedAt.toLocaleString()}</time></span>`,
              ]
            : []),
          "</li>",
        ].join("\n");
      }),
    "  </ul>",
    "</div>",
    "</body>",
    "</html>",
  ].join("\n");
}

function blockedUsersURL() {
  const b = new Blob([blockedUsersHTML()], {
    type: "text/html;charset=UTF-8",
  });
  return URL.createObjectURL(b);
}

interface Component {
  render: () => void;
}

function createApp(): Component {
  const rawURL = window.location.href;
  const components: Component[] = [{ render: renderNav }];
  const userID = parseUserURL(rawURL);
  const url = new URL(rawURL);
  if (userID) {
    components.push({ render: () => renderActions(userID) });
  } else if (parseVideoURL(rawURL)) {
    components.push({ render: renderVideoDetail });
  } else if (
    url.host === "www.bilibili.com" &&
    url.pathname.startsWith("/v/popular/rank/all")
  ) {
    components.push({ render: renderVPopularRankAll });
  } else if (
    url.host === "www.bilibili.com" &&
    url.pathname.startsWith("/v/popular/")
  ) {
    components.push({ render: renderVPopular });
  } else {
    components.push({ render: renderVideoList });
  }

  return {
    render: () => components.forEach((i) => i.render()),
  };
}

async function main() {
  await migrateV1();

  const app = createApp();

  usePolling({
    update: () => app.render(),
    scheduleNext: (update) => setTimeout(update, 100),
  });
}

main();
