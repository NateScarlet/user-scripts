import obtainHTMLElementByID from '@/utils/obtainHTMLElementByID';
import randomUUID from '@/utils/randomUUID';
import { mdiAccountCheckOutline, mdiClose, mdiOpenInNew } from '@mdi/js';
import { html, nothing, render } from 'lit-html';
import compare from '@/utils/compare';
import { debounce } from 'lodash-es';
import style from '../style';
import blockedUsers from '../models/blockedUsers';
import homePageSettings from '../models/homePageSettings';
import videoListSettings from '../models/videoListSettings';

// spell-checker: word datetime

export default class SettingsDrawer {
  private isOpen = false;

  private visible = false;

  private readonly id: string;

  constructor() {
    this.id = `settings-${randomUUID()}`;
  }

  public readonly open = () => {
    this.visible = true;
    this.render();
    setTimeout(() => {
      this.isOpen = true;
      this.render();
    }, 20);
  };

  public readonly close = () => {
    this.isOpen = false;
  };

  private html() {
    if (!this.visible) {
      return nothing;
    }
    return html`
    <div 
      class="
        fixed inset-0 
        bg-white bg-opacity-25 backdrop-blur 
        cursor-zoom-out transition duration-200 ease-in-out
        ${this.isOpen ? 'opacity-100' : 'opacity-0'}
      "
      @click=${() => this.close()}
    >
    </div>
    <div
      class="
        fixed inset-y-0 right-0 w-screen max-w-4xl
        bg-white overflow-auto p-2 
        transition-transform transform
        ${this.isOpen ? '' : 'translate-x-full'}
        flex flex-col gap-2
      "
      @transitionend=${() => {
        if (!this.isOpen) {
          this.visible = false;
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
     ${this.homePageSettings()}
     ${this.videoListSettings()}
     ${this.userTable()}
    </div>`;
  }

  private homePageSettings() {
    return html`
      <section class="flex-none">
        <h1 class="text-sm text-gray-500">主页</h1>
        <div class="px-1">
          <label>
            <input
              type="checkbox"
              .checked="${homePageSettings.allowAdblockTips}"
              @change="${(e: Event) => {
                const el = e.target as HTMLInputElement;
                homePageSettings.allowAdblockTips = el.checked;
              }}"
            />
            <span>允许</span>
            <span class="text-sm rounded" 
              style="
                color: #e58900;
                background-color: #fff0e3;
              "
            >检测到您的页面...</span>
            <span>提示</span>
          </label>
          <section>
            <h2 class="text-gray-500 text-sm">楼层推广卡片</h2>
            <div class="px-1">
              <div>
                <label>
                  <input
                    type="checkbox"
                    ?checked="${homePageSettings.floorCard.excludeAll}"
                    @change="${(e: Event) => {
                      const el = e.target as HTMLInputElement;
                      homePageSettings.floorCard.excludeAll = el.checked;
                    }}"
                  />
                  <span>屏蔽所有</span>
                </label>
              </div>
              ${(() => {
                if (homePageSettings.floorCard.excludeAll) {
                  return nothing;
                }
                if (homePageSettings.floorCard.excludeByChannel.length === 0) {
                  return html`<div class="text-gray-500 text-sm">
                    可通过指针悬停在卡片上时左上角显示的按钮来屏蔽单个频道的推广
                  </div>`;
                }
                return html`
                <div>
                  <h2 class="flex-none text-sm text-gray-500">
                    已屏蔽频道 <span class="text-sm">(${
                      homePageSettings.floorCard.excludeByChannel.length
                    })</span>
                  </h1>
                  <ol class="flex flex-wrap gap-2 items-center">
                    ${homePageSettings.floorCard.excludeByChannel.map(
                      (channel) => {
                        return html`
                      <li class="bg-gray-300 rounded px-1 flex items-center">
                        <span>${channel}</span>
                        <button
                          type="button"
                          @click=${() => {
                            homePageSettings.floorCard.excludeByChannel =
                              homePageSettings.floorCard.excludeByChannel.filter(
                                (i) => i !== channel
                              );
                          }}
                        >
                          <svg 
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-[1.25em]"
                          >
                            <path fill-rule="evenodd" clip-rule="evenodd" d=${mdiClose} fill="currentColor">
                          </svg>
                        </button>
                      </li>`;
                      }
                    )}
                  </ol>
                </div>
              `;
              })()}
            </section>
          </div>
        </div>
      </section>
    `;
  }

  private videoListSettings() {
    return html`
      <section class="flex-none">
        <h1 class="text-sm text-gray-500">视频列表</h1>
        <div class="px-1">
          <label>
            <input
              type="checkbox"
              ?checked="${videoListSettings.allowAdvertisement}"
              @change="${(e: Event) => {
                const el = e.target as HTMLInputElement;
                videoListSettings.allowAdvertisement = el.checked;
              }}"
            />
            <span>允许广告</span>
          </label>
          <label class="flex items-center">
            <span class="flex-none w-32">最短（含）</span>
            <input
              class="flex-auto border my-1 p-1"
              type="text"
              placeholder="HH:MM:SS"
              value="${videoListSettings.durationGte.toTimeCode()}"
              @input="${this.onVideListDurationGteChange}"
              @blur="${() => {
                this.onVideListDurationGteChange.flush();
              }}"
              @keyup="${(e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                  this.onVideListDurationGteChange(e);
                  this.onVideListDurationGteChange.flush();
                }
              }}"
            />
          </label>
          <label class="flex items-center">
            <span class="flex-none w-32">最长（不含）</span>
            <input
              class="flex-auto border my-1 p-1"
              type="text"
              placeholder="HH:MM:SS"
              value="${videoListSettings.durationLt.toTimeCode()}"
              @input="${this.onVideListDurationLtChange}"
              @blur="${() => {
                this.onVideListDurationLtChange.flush();
              }}"
              @keyup="${(e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                  this.onVideListDurationLtChange(e);
                  this.onVideListDurationLtChange.flush();
                }
              }}"
            />
          </label>
        </div>
      </section>
    `;
  }

  private readonly onVideListDurationGteChange = debounce((e: Event) => {
    const el = e.target as HTMLInputElement;
    videoListSettings.durationGte = el.value;
    el.value = videoListSettings.durationGte.toTimeCode();
  }, 5e3);

  private readonly onVideListDurationLtChange = debounce((e: Event) => {
    const el = e.target as HTMLInputElement;
    videoListSettings.durationLt = el.value;
    el.value = videoListSettings.durationLt.toTimeCode();
  }, 5e3);

  private userTable() {
    const userIDs = blockedUsers.distinctID();

    return html`
      <div class="flex-auto flex flex-col overflow-hidden max-h-screen">
        <h1 class="flex-none text-sm text-gray-500">
          已屏蔽用户 <span class="text-sm">(${userIDs.length})</span>
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

  public readonly render = () => {
    render(
      this.html(),
      obtainHTMLElementByID({
        tag: 'div',
        id: this.id,
        onDidCreate: (el) => {
          el.style.position = 'relative';
          el.style.zIndex = '9999';
          el.style.fontSize = '1rem';
          style.apply(el);
          document.body.append(el);
        },
      })
    );
  };
}
