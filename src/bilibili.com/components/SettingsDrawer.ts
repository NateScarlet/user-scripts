import obtainHTMLElementByID from '@/utils/obtainHTMLElementByID';
import randomUUID from '@/utils/randomUUID';
import {
  mdiAccountCheckOutline,
  mdiCheck,
  mdiClose,
  mdiOpenInNew,
} from '@mdi/js';
import { html, nothing, render } from 'lit-html';
import compare from '@/utils/compare';
import { debounce } from 'lodash-es';
import growTextAreaHeight from '@/utils/growTextAreaHeight';
import isNonNull from '@/utils/isNonNull';
import blockedUsers from '../models/blockedUsers';
import homePageSettings from '../models/homePageSettings';
import videoListSettings from '../models/videoListSettings';
import searchSettings from '../models/searchSettings';
import blockedLiveRooms from '../models/blockedLiveRooms';
import obtainStyledShadowRoot from '../utils/obtainStyledShadowRoot';
import showPromptDialog from '../utils/showPromptDialog';

// spell-checker: word datetime

export default class SettingsDrawer {
  private isOpen = false;

  private active = false;

  private static readonly id: string = `settings-${randomUUID()}`;

  public readonly open = () => {
    this.active = true;
    this.render();
    setTimeout(() => {
      this.isOpen = true;
      this.render();
    }, 20);
  };

  public readonly close = () => {
    this.isOpen = false;
    this.render();
    // // force close in case transition not work
    // setTimeout(() => {
    //   if (!this.isOpen) {
    //     this.active = false;
    //     this.render();
    //   }
    // }, 1e3);
  };

  private html() {
    if (!this.active) {
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
        bg-white overflow-auto p-2 space-y-1
        transition-transform
        ${this.isOpen ? '' : 'translate-x-full'}
      "
      @transitionend=${() => {
        if (!this.isOpen) {
          this.active = false;
          this.render();
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
     ${this.searchSettings()}
     ${this.videoListSettings()}
     ${this.userTable()}
     ${this.liveRoomTable()}
    </div>`;
  }

  private homePageSettings() {
    return html`
      <section>
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

  private excludedKeywordsBuffer: string | undefined;

  private get excludedKeywords() {
    return (
      this.excludedKeywordsBuffer ??
      videoListSettings.excludeKeywords.join('\n')
    );
  }

  private set excludedKeywords(v: string) {
    this.excludedKeywordsBuffer = v;
    videoListSettings.excludeKeywords = v.split('\n');
  }

  private videoListSettings() {
    return html`
      <section>
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
            <span>允许广告（非视频）</span>
          </label>
          <label>
            <input
              type="checkbox"
              ?checked="${videoListSettings.allowPromoted}"
              @change="${(e: Event) => {
                const el = e.target as HTMLInputElement;
                videoListSettings.allowPromoted = el.checked;
              }}"
            />
            <span>允许推广</span>
          </label>
          <label class="flex items-center">
            <span class="flex-none w-32">最短（含）</span>
            <input
              class="flex-auto border my-1 p-1"
              type="text"
              placeholder="HH:MM:SS"
              value="${videoListSettings.durationGte.toTimeCode()}"
              @input="${this.onVideListDurationGteChange}"
              @keydown="${(e: Event) => e.stopPropagation()}"
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
              @keydown="${(e: Event) => e.stopPropagation()}"
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
          <label class="flex items-center">
            <div class="flex-none w-32">排除关键词</div>
            <div class="flex-auto">
              <textarea
                class="w-full border my-1 p-1"
                placeholder=""
                .value="${this.excludedKeywords}"
                @input="${this.onExcludeKeywordInput}"
                @keydown="${(e: Event) => e.stopPropagation()}"
                @focus="${(e: Event) =>
                  growTextAreaHeight(e.target as HTMLTextAreaElement)}"
                @blur=${() => {
                  this.excludedKeywordsBuffer = undefined;
                }}
              ></textarea>
              <div class="text-gray-500 text-sm">
                不显示标题含关键词的视频。每行一个，不区分大小写。
              </div>
            </div>
          </label>
        </div>
      </section>
    `;
  }

  private readonly onExcludeKeywordInput = (e: Event) => {
    const el = e.target as HTMLTextAreaElement;
    this.excludedKeywords = el.value;
    growTextAreaHeight(el);
  };

  private searchSettings() {
    return html`
      <section>
        <h1 class="text-sm text-gray-500">搜索</h1>
        <div class="px-1">
          <label>
            <input
              type="checkbox"
              ?checked="${searchSettings.strictTitleMatch}"
              @change="${(e: Event) => {
                const el = e.target as HTMLInputElement;
                searchSettings.strictTitleMatch = el.checked;
              }}"
            />
            <span>严格标题匹配</span>
          </label>
          <div class="text-gray-500 text-sm">
            标题必须包含所有关键词，屏蔽联想词和标签匹配
          </div>
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
      <div class="flex flex-col overflow-hidden max-h-[50vh]">
        <h1 class="flex-none text-sm text-gray-500">
          已屏蔽用户 <span class="text-sm">(${userIDs.length})</span>
        </h1>
        <div class="flex-1 overflow-auto relative">
          <table class="table-fixed border-separate border-spacing-2 w-full">
            <thead class="sticky top-0">
              <tr class="bg-gray-200 text-center">
                <td class="w-48">屏蔽时间</td>
                <td>名称</td>
                <td class="w-64"></td>
              </tr>
            </thead>
            <tbody>
              ${userIDs
                .map(blockedUsers.get)
                .filter(isNonNull)
                .sort((a, b) => {
                  const dateCompare = compare(a.blockedAt, b.blockedAt);
                  if (dateCompare !== 0) {
                    return -dateCompare;
                  }
                  return compare(a.idAsNumber, b.idAsNumber);
                })
                .map(({ id, name, note, blockedAt, rawBlockedAt }) => {
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
                      <td class="text-center hover:underline cursor-text" @click=${async () => {
                        const v = await showPromptDialog({
                          title: `编辑备注`,
                          label: `为 ${name} 添加备注:`,
                          value: note,
                          placeholder: '输入备注...',
                          actionText: '保存备注',
                        });
                        if (v != null) {
                          blockedUsers.update(id, {
                            note: v,
                          });
                        }
                      }}>
                        ${name}
                        <div class="whitespace-nowrap truncate text-xs font-serif" title="${note}">
                          ${note}
                        </div>
                      </td>
                      <td
                      >
                 
                        <div class="transition opacity-0 group-hover:opacity-100 space-x-2 text-center">
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
                        </div>
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

  private liveRoomTable() {
    const liveRoomIDs = blockedLiveRooms.distinctID();

    return html`
      <div class="flex flex-col overflow-hidden max-h-[50vh]">
        <h1 class="flex-none text-sm text-gray-500">
          已屏蔽直播间 <span class="text-sm">(${liveRoomIDs.length})</span>
        </h1>
        <div class="flex-1 overflow-auto relative">
          <table class="table-fixed border-separate border-spacing-2 w-full">
            <thead class="sticky top-0">
              <tr class="bg-gray-200 text-center">
                <td>屏蔽时间</td>
                <td>所有者</td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              ${liveRoomIDs
                .map(blockedLiveRooms.get)
                .sort((a, b) => {
                  const dateCompare = compare(a.blockedAt, b.blockedAt);
                  if (dateCompare !== 0) {
                    return -dateCompare;
                  }
                  return compare(a.id, b.id);
                })
                .map(({ id, owner, blockedAt }) => {
                  return html`
                    <tr class="group even:bg-gray-100">
                      <td class="text-right w-32">
                       <time datetime="${blockedAt.toISOString()}">
                          ${blockedAt.toLocaleString()}
                        </time>
                      </td>
                      <td class="text-center">${owner}</td>
                      <td
                        class="transition opacity-0 group-hover:opacity-100 space-x-2 text-center"
                      >
                        <a
                          href="https://live.bilibili.com/${id}"
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
                          <span>前往</span>
                        </a>
                        <button
                          type="button"
                          @click=${() => blockedLiveRooms.remove(id)}
                          class="inline-flex underline"
                        >
                          <svg 
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-[1.25em]"
                          >
                            <path fill-rule="evenodd" clip-rule="evenodd" d=${mdiCheck} fill="currentColor">
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
      obtainStyledShadowRoot(
        obtainHTMLElementByID({
          tag: 'div',
          id: SettingsDrawer.id,
          onDidCreate: (el) => {
            el.style.position = 'fixed';
            el.style.zIndex = '9999';
            document.body.append(el);
          },
        })
      )
    );
  };
}
