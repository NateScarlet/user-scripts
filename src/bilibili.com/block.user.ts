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
import useGMValue from "@/utils/useGMValue";
import usePolling from "@/utils/usePolling";
import { render, html, nothing } from "lit-html";
import {
  mdiAccountCancelOutline,
  mdiAccountCheckOutline,
  mdiClose,
  mdiOpenInNew,
} from "@mdi/js";
import setHTMLElementDisplayHidden from "@/utils/setHTMLElementDisplayHidden";
import obtainHTMLElementByDataKey from "@/utils/obtainHTMLElementByDataKey";
import castPlainObject from "@/utils/castPlainObject";
import getElementSelector from "@/utils/getElementSelector";
import evalInContentScope from "@/utils/evalInContentScope";
import useDisposal from "@/utils/useDisposal";
import obtainHTMLElementByID from "@/utils/obtainHTMLElementByID";
import randomUUID from "@/utils/randomUUID";
import style from "./style";
import injectStyle from "@/utils/injectStyle";

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

const blockedUsersModel = new (class {
  has(id: string) {
    return id in blockedUsers;
  }

  get(id: string) {
    const value = blockedUsers.value[id];
    const { blockedAt: rawBlockedAt = 0, name = id } =
      typeof value === "boolean" ? {} : value ?? {};
    const blockedAt = new Date(rawBlockedAt);
    return {
      id,
      blockedAt,
      name,
      idAsNumber: Number.parseInt(id),
      rawBlockedAt,
    };
  }
  distinctID() {
    return Object.keys(blockedUsers.value);
  }

  add({ id, name }: { id: string; name: string }) {
    if (id in blockedUsers.value) {
      return;
    }
    blockedUsers.value = {
      ...blockedUsers.value,
      [id]: {
        name: name.trim(),
        blockedAt: Date.now(),
      },
    };
  }

  remove(id: string) {
    if (!(id in blockedUsers.value)) {
      return;
    }
    blockedUsers.value = {
      ...blockedUsers.value,
      [id]: undefined,
    };
  }
})();
// const minVideoDuration = useGMValue(
//   "minVideoDuration@206ceed9-b514-4902-ad70-aa621fed5cd",
//   "P0D"
// );
// const minVideoDurationModel = {
//   get() {
//     return Duration.parse(minVideoDuration.value);
//   },
//   set(v: DurationInput) {
//     minVideoDuration.value = Duration.cast(v).toISOString();
//   },
// };

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

  const container = obtainHTMLElementByID({
    tag: "div",
    id: "7ced1613-89d7-4754-8989-2ad0d7cfa9db",
    onDidCreate: (el) => {
      el.style.display = "inline";
      parent.append(el, parent.lastChild!);
    },
  });
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

    const isBlocked = blockedUsersModel.has(userID);
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
    blockedUsers.value = {
      ...blockedUsers.value,
      [user.id]: {
        name: user.name,
        blockedAt: Date.now(),
      },
    };
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

interface Component {
  render: () => void;
}

class SettingsDrawer {
  #open = false;
  #visible = false;

  readonly id: string;

  constructor() {
    this.id = `settings-${randomUUID()}`;
  }

  open() {
    this.#visible = true;
    this.render();
    setTimeout(() => {
      this.#open = true;
      this.render();
    }, 20);
  }

  close() {
    this.#open = false;
  }

  #html() {
    if (!this.#visible) {
      return nothing;
    }
    return html`
    <div 
      class="
        fixed inset-0 
        bg-white bg-opacity-25 backdrop-blur 
        cursor-zoom-out transition duration-200 ease-in-out
        ${this.#open ? "opacity-100" : "opacity-0"}
      "
      @click=${() => this.close()}
    >
    </div>
    <div
      class="
        fixed inset-y-0 right-0 w-screen max-w-4xl
        bg-white overflow-auto p-2 
        transition-transform transform
        ${this.#open ? "" : "translate-x-full"}
        flex flex-col
      "
      @transitionend=${() => {
        if (!this.#open) {
          this.#visible = false;
        }
      }}
    >
      <button 
        type="button" 
        class="lg:hidden self-end flex items-center"
        @click=${() => this.close()}
      >
        <svg 
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="h-[1.25em] align-top"
        >
          <path fill-rule="evenodd" clip-rule="evenodd" d=${mdiClose} fill="currentColor">
        </svg>
        <span>关闭</span>
      </button>
     ${this.#userTableHTML()}
    </div>`;
  }

  #userTableHTML() {
    const userIDs = blockedUsersModel.distinctID();

    return html`
      <div class="flex-auto flex flex-col overflow-hidden max-h-screen">
        <h1 class="flex-none text-sm text-gray-500">
          已屏蔽的用户 <span class="text-sm">(${userIDs.length})</span>
        </h1>
        <div class="flex-1 overflow-auto relative">
          <table class="table-fixed border-separate border-spacing-2 w-full">
            <thead class="sticky top-0">
              <tr class="bg-gray-200 text-center">
                <td>屏蔽时间</td>
                <td>名称</td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              ${userIDs
                .map(blockedUsersModel.get)
                .sort((a, b) => {
                  const dateCompare = compare(a.blockedAt, b.blockedAt);
                  if (dateCompare !== 0) {
                    return -dateCompare;
                  }
                  return compare(a.idAsNumber, b.idAsNumber);
                })
                .map(({ id, name, blockedAt, rawBlockedAt }) => {
                  return html`
                    <tr class="group even:bg-gray-100">
                      <td class="text-right w-32">
                        ${
                          rawBlockedAt
                            ? html` <time datetime="${blockedAt.toISOString()}">
                                ${blockedAt.toLocaleString()}
                              </time>`
                            : nothing
                        }
                      </td>
                      <td class="text-center">${name}</td>
                      <td
                        class="transition opacity-0 group-hover:opacity-100 space-x-2 text-center"
                      >
                        <a
                          href="https://space.bilibili.com/${id}"
                          target="_blank"
                          class="inline-flex underline text-blue-500"
                        >
                          <svg 
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-[1.25em]"
                          >
                            <path fill-rule="evenodd" clip-rule="evenodd" d=${mdiOpenInNew} fill="currentColor">
                          </svg>
                          <span>个人空间</span>
                        </a>
                        <button
                          type="button"
                          @click=${() => blockedUsersModel.remove(id)}
                          class="inline-flex underline"
                        >
                          <svg 
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-[1.25em]"
                          >
                            <path fill-rule="evenodd" clip-rule="evenodd" d=${mdiAccountCheckOutline} fill="currentColor">
                          </svg>
                          <span>取消屏蔽</span>
                        </button>
                      </td>
                    </tr>
                  `;
                })}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  render() {
    render(
      this.#html(),
      obtainHTMLElementByID({
        tag: "div",
        id: this.id,
        onDidCreate: (el) => {
          el.style.position = "relative";
          el.style.zIndex = "9999";
          el.style.fontSize = "1rem";
          style.apply(el);
          document.body.append(el);
        },
      })
    );
  }
}

class NavButton {
  #settings: SettingsDrawer;
  constructor(settings: SettingsDrawer) {
    this.#settings = settings;
  }

  render() {
    const parent = document.querySelector(".right-entry");
    if (!parent) {
      return;
    }
    const container = obtainHTMLElementByID({
      tag: "li",
      id: "db7a644d-1c6c-4078-a9dc-991b15b68014",
      onDidCreate: (el) => {
        style.apply(el);
        el.classList.add("right-entry-item");
        parent.prepend(parent.firstChild!, el);
      },
    });
    const count = blockedUsersModel.distinctID().length;
    render(
      html`
<button
  type="button"
  class="right-entry__outside" 
  @click=${(e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    this.#settings.open();
  }}
>
  <svg viewBox="2 2 20 20" class="right-entry-icon h-5 fill-current">
    <path fill-rule="evenodd" clip-rule="evenodd" d=${mdiAccountCancelOutline}>
  </svg>
  <span class="right-entry-text">
    <span>屏蔽</span>
    ${count > 0 ? html`<span>(${count})</span>` : nothing}
  </span>
</button>
`,
      container
    );
  }
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
  await migrateV1();

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

main();
