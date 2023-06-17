import obtainHTMLElementByID from "@/utils/obtainHTMLElementByID";
import randomUUID from "@/utils/randomUUID";
import { mdiAccountCheckOutline, mdiClose, mdiOpenInNew } from "@mdi/js";
import { html, nothing, render } from "lit-html";
import compare from "@/utils/compare";
import style from "../style";
import blockedUsers from "../models/blockedUsers";

export default class SettingsDrawer {
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
    const userIDs = blockedUsers.distinctID();

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
                .map(blockedUsers.get)
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
                          @click=${() => blockedUsers.remove(id)}
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
