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

import { render, html } from "lit-html";
import { mdiAccountCancelOutline } from "@mdi/js";
import usePolling from "@/utils/usePolling";
import setHTMLElementDisplayHidden from "@/utils/setHTMLElementDisplayHidden";
import obtainHTMLElementByDataKey from "@/utils/obtainHTMLElementByDataKey";
import castPlainObject from "@/utils/castPlainObject";
import getElementSelector from "@/utils/getElementSelector";
import evalInContentScope from "@/utils/evalInContentScope";
import useDisposal from "@/utils/useDisposal";
import obtainHTMLElementByID from "@/utils/obtainHTMLElementByID";
import injectStyle from "@/utils/injectStyle";
import onDocumentReadyOnce from "@/utils/onDocumentReadyOnce";
import isNonNull from "@/utils/isNonNull";
import style from "./style";
import Component from "./components/Component";
import SettingsDrawer from "./components/SettingsDrawer";
import NavButton from "./components/NavButton";
import blockedUsers from "./models/blockedUsers";
import migrate from "./models/migrate";

export {};

function renderActions(userID: string) {
  const parent = document.querySelector(".h-action");
  if (!parent) {
    return;
  }

  const container = obtainHTMLElementByID({
    tag: "div",
    id: "7ced1613-89d7-4754-8989-2ad0d7cfa9db",
    onDidCreate: (el) => {
      el.style.display = "inline";
      parent.append(...[el, parent.lastChild].filter(isNonNull));
    },
  });
  const isBlocked = !!blockedUsers.has(userID);

  render(
    html`
      <span
        class="h-f-btn"
        @click=${(e: MouseEvent) => {
          e.stopPropagation();
          blockedUsers.toggle({
            id: userID,
            name: document.getElementById("h-name")?.innerText ?? "",
          });
        }}
      >
        ${isBlocked ? "取消屏蔽" : "屏蔽"}
      </span>
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
    default:
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
[data-${key}]:hover button {
  opacity: 100;
  transition: opacity 0.2s linear 0.2s;
}

[data-${key}] button {
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
      style.apply(el);
      parentNode.setAttribute(`data-${key}`, "");
      parentNode.append(el);
    },
  });
  render(
    html`
<button
  type="button"
  title="屏蔽此用户"
  class="absolute top-2 left-2 rounded-md cursor-pointer text-white bg-[rgba(33,33,33,.8)] z-20 border-none"
  @click=${(e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    blockedUsers.add(user);
  }}
>
  <svg viewBox="-3 -1 28 28" class="h-7 fill-current">
    <path fill-rule="evenodd" clip-rule="evenodd" d=${mdiAccountCancelOutline}>
  </svg>
</button>
    `,
    el
  );
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
    const isBlocked = blockedUsers.has(userID);
    let container = i;
    while (container.parentElement?.childElementCount === 1) {
      container = container.parentElement;
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
    if (typeof mid !== "number" || typeof name !== "string") {
      return;
    }

    const userID = mid.toString();
    const isBlocked = blockedUsers.has(userID);
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

    const isBlocked = blockedUsers.has(userID);
    setHTMLElementDisplayHidden(i, isBlocked);
    if (!isBlocked) {
      renderHoverButton(i.querySelector(".img"), {
        id: userID,
        name,
      });
    }
  });
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
      const isBlocked = blockedUsers.has(userID);
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

function createApp(): Component {
  const rawURL = window.location.href;
  const settings = new SettingsDrawer();
  const components: Component[] = [settings, new NavButton(settings)];
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
  await migrate();

  const initialPath = window.location.pathname;
  const app = createApp();

  const { push, dispose } = useDisposal();
  push(
    usePolling({
      update: () => {
        if (window.location.pathname !== initialPath) {
          // route changed
          dispose();
          main();
          return;
        }
        style.inject();
        app.render();
      },
      scheduleNext: (update) => setTimeout(update, 100),
    })
  );
}

onDocumentReadyOnce(main);
