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
import { debounce } from 'es-toolkit';
import growTextAreaHeight from '@/utils/growTextAreaHeight';
import isNonNull from '@/utils/isNonNull';
import blockedUsers from '../models/blockedUsers';
import blockedUserPatterns from '../models/blockedUserPatterns';
import homePageSettings from '../models/homePageSettings';
import videoListSettings from '../models/videoListSettings';
import searchSettings from '../models/searchSettings';
import blockedLiveRooms from '../models/blockedLiveRooms';
import obtainStyledShadowRoot from '../utils/obtainStyledShadowRoot';
import showPromptDialog from '../utils/showPromptDialog';
import getCurrentTheme from '../utils/getCurrentTheme';

// spell-checker: word datetime

export default class SettingsDrawer {
  private isOpen = false;

  private active = false;

  private static readonly id: string = `settings-${randomUUID()}`;

  private userTableScrollTop = 0;

  private liveRoomTableScrollTop = 0;

  private dataVersion = 0;

  private userListCache:
    | {
        version: number;
        data: NonNullable<ReturnType<typeof blockedUsers.get>>[];
      }
    | undefined;

  private liveRoomListCache:
    | {
        version: number;
        data: NonNullable<ReturnType<typeof blockedLiveRooms.get>>[];
      }
    | undefined;

  public readonly open = () => {
    this.active = true;
    this.dataVersion += 1;
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
      data-theme="${getCurrentTheme()}"
      class="
        fixed inset-0 
        bg-white/25 dark:bg-black/25  backdrop-blur
        cursor-zoom-out transition duration-200 ease-in-out
        ${this.isOpen ? 'opacity-100' : 'opacity-0'}
      "
      @click=${() => this.close()}
    >
    </div>
    <div
      data-theme="${getCurrentTheme()}"
      class="
        fixed inset-y-0 right-0 w-screen max-w-4xl
        bg-white text-black dark:bg-black dark:text-white overflow-auto p-2 space-y-1
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
     ${this.blockedUserPatternsSettings()}
     ${this.userTable()}
     ${this.liveRoomTable()}
    </div>`;
  }

  private homePageSettings() {
    return html`
      <section>
        <h1 class="text-sm text-gray-500 dark:text-gray-200">主页</h1>
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
            <h2 class="text-gray-500 dark:text-gray-200 text-sm">楼层推广卡片</h2>
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
                  return html`<div
                    class="text-gray-500 dark:text-gray-200 text-sm"
                  >
                    可通过指针悬停在卡片上时左上角显示的按钮来屏蔽单个频道的推广
                  </div>`;
                }
                return html`
                <div>
                  <h2 class="flex-none text-sm text-gray-500 dark:text-gray-200">
                    已屏蔽频道 <span class="text-sm">(${
                      homePageSettings.floorCard.excludeByChannel.length
                    })</span>
                  </h1>
                  <ol class="flex flex-wrap gap-2 items-center">
                    ${homePageSettings.floorCard.excludeByChannel.map(
                      (channel) => {
                        return html`
                      <li class="bg-gray-300 dark:bg-gray-700 rounded px-1 flex items-center">
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
        <h1 class="text-sm text-gray-500 dark:text-gray-200">视频列表</h1>
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
              class="flex-auto border my-1 p-1 dark:bg-gray-800 dark:text-white dark:border-gray-500"
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
              class="flex-auto border my-1 p-1 dark:bg-gray-800 dark:text-white dark:border-gray-500"
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
                class="w-full border my-1 p-1 dark:bg-gray-800 dark:text-white dark:border-gray-500"
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
              <div class="text-gray-500 dark:text-gray-200 text-sm">
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
        <h1 class="text-sm text-gray-500 dark:text-gray-200">搜索</h1>
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
          <div class="text-gray-500 dark:text-gray-200 text-sm">
            标题必须包含所有关键词，屏蔽联想词和标签匹配
          </div>
        </div>
        <div class="px-1">
          <label>
            <input
              type="checkbox"
              ?checked="${searchSettings.disableNavSuggestion}"
              @change="${(e: Event) => {
                const el = e.target as HTMLInputElement;
                searchSettings.disableNavSuggestion = el.checked;
              }}"
            />
            <span>禁用导航栏搜索建议</span>
          </label>
          <div class="text-gray-500 dark:text-gray-200 text-sm">
            仅隐藏文本，不影响默认搜索行为
          </div>
        </div>
      </section>
    `;
  }

  private blockedUserPatternsBuffer: string | undefined;

  private get blockedUserPatterns() {
    return (
      this.blockedUserPatternsBuffer ??
      blockedUserPatterns
        .get()
        .map((i) => i.pattern)
        .join('\n')
    );
  }

  private set blockedUserPatterns(v: string) {
    this.blockedUserPatternsBuffer = v;
    blockedUserPatterns.set(
      v
        .split('\n')
        .map((i) => i.trim())
        .filter((i) => i)
    );
  }

  private blockedUserPatternsSettings() {
    return html`
      <section>
        <h1 class="text-sm text-gray-500 dark:text-gray-200">
          屏蔽名称匹配的用户
        </h1>
        <div class="px-1">
          <textarea
            class="w-full border my-1 p-1 dark:bg-gray-800 dark:text-white dark:border-gray-500"
            placeholder=""
            .value="${this.blockedUserPatterns}"
            @input="${this.onBlockedUserPatternInput}"
            @keydown="${(e: Event) => e.stopPropagation()}"
            @focus="${(e: Event) =>
              growTextAreaHeight(e.target as HTMLTextAreaElement)}"
            @blur=${() => {
              this.blockedUserPatternsBuffer = undefined;
            }}
          ></textarea>
          <div class="text-gray-500 dark:text-gray-200 text-sm">
            每行一个，支持正则。
          </div>
        </div>
      </section>
    `;
  }

  private readonly onBlockedUserPatternInput = (e: Event) => {
    const el = e.target as HTMLTextAreaElement;
    this.blockedUserPatterns = el.value;
    growTextAreaHeight(el);
  };

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

  private getSortedBlockedUsers() {
    if (this.userListCache && this.userListCache.version === this.dataVersion) {
      return this.userListCache.data;
    }
    const data = blockedUsers
      .distinctID()
      .map(blockedUsers.get)
      .filter(isNonNull)
      .sort((a, b) => {
        const dateCompare = compare(a.blockedAt, b.blockedAt);
        if (dateCompare !== 0) {
          return -dateCompare;
        }
        return compare(a.idAsNumber, b.idAsNumber);
      });
    this.userListCache = { version: this.dataVersion, data };
    return data;
  }

  private readonly onUserTableScroll = (e: Event) => {
    const el = e.target as HTMLElement;
    this.userTableScrollTop = el.scrollTop;
    this.render();
  };

  private userTable() {
    const items = this.getSortedBlockedUsers();
    const rowHeight = 48; // h-12
    const gap = 8; // gap-2
    const itemTotalHeight = rowHeight + gap;
    const totalHeight =
      items.length * itemTotalHeight - (items.length > 0 ? gap : 0);

    // Virtualize
    const containerHeight = 500; // Approx max height
    const scrollTop = this.userTableScrollTop;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemTotalHeight));
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemTotalHeight) + 1
    );
    const visibleItems = items.slice(startIndex, endIndex);

    return html`
      <div class="flex flex-col overflow-hidden max-h-[50vh]">
        <h1 class="flex-none text-sm text-gray-500 dark:text-gray-200 mb-1">
          已屏蔽用户 <span class="text-sm">(${items.length})</span>
        </h1>

        <!-- Header -->
        <div
          class="flex-none flex items-center bg-gray-200 dark:bg-gray-800 text-center font-bold h-10 pr-2"
        >
          <div class="w-48 flex-none">屏蔽时间</div>
          <div class="flex-auto">名称</div>
          <div class="w-64 flex-none"></div>
        </div>

        <div
          class="flex-1 overflow-auto relative"
          @scroll=${this.onUserTableScroll}
        >
          <div style="height: ${totalHeight}px; width: 100%;">
            ${visibleItems.map((item, index) => {
              const actualIndex = startIndex + index;
              const top = actualIndex * itemTotalHeight;
              const { id, name, note, blockedAt, rawBlockedAt } = item;
              return html`
                <div 
                  class="absolute left-0 right-0 h-12 flex items-center bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition group"
                  style="top: ${top}px;"
                >
                   <div class="w-48 flex-none text-right px-2 text-sm">
                        ${
                          rawBlockedAt
                            ? html` <time datetime="${blockedAt.toISOString()}">
                                ${blockedAt.toLocaleString()}
                              </time>`
                            : nothing
                        }
                   </div>
                   <div 
                      class="flex-auto text-center hover:underline cursor-pointer px-2 truncate"
                      @click=${async () => {
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
                          this.dataVersion += 1;
                          this.render();
                        }
                      }}
                   >
                        ${name}
                        <div class="text-xs text-gray-500 truncate" title="${note}">${note}</div>
                   </div>
                   <div class="w-64 flex-none flex justify-center items-center space-x-2 opacity-0 group-hover:opacity-100 transition">
                          <a
                            href="https://space.bilibili.com/${id}"
                            target="_blank"
                            class="inline-flex items-center underline text-blue-500 text-sm"
                          >
                            <svg 
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              class="h-[1.25em] mr-1"
                            >
                              <path fill-rule="evenodd" clip-rule="evenodd" d=${mdiOpenInNew} fill="currentColor">
                            </svg>
                            <span>个人空间</span>
                          </a>
                          <button
                            type="button"
                            @click=${() => {
                              blockedUsers.remove(id);
                              this.dataVersion += 1;
                              this.render();
                            }}
                            class="inline-flex items-center underline text-sm"
                          >
                            <svg 
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              class="h-[1.25em] mr-1"
                            >
                              <path fill-rule="evenodd" clip-rule="evenodd" d=${mdiAccountCheckOutline} fill="currentColor">
                            </svg>
                            <span>取消屏蔽</span>
                          </button>
                   </div>
                </div>
              `;
            })}
          </div>
        </div>
      </div>
    `;
  }

  private getSortedBlockedLiveRooms() {
    if (
      this.liveRoomListCache &&
      this.liveRoomListCache.version === this.dataVersion
    ) {
      return this.liveRoomListCache.data;
    }
    const data = blockedLiveRooms
      .distinctID()
      .map(blockedLiveRooms.get)
      .sort((a, b) => {
        const dateCompare = compare(a.blockedAt, b.blockedAt);
        if (dateCompare !== 0) {
          return -dateCompare;
        }
        return compare(a.id, b.id);
      });
    this.liveRoomListCache = { version: this.dataVersion, data };
    return data;
  }

  private readonly onLiveRoomTableScroll = (e: Event) => {
    const el = e.target as HTMLElement;
    this.liveRoomTableScrollTop = el.scrollTop;
    this.render();
  };

  private liveRoomTable() {
    const items = this.getSortedBlockedLiveRooms();

    const rowHeight = 48; // h-12
    const gap = 8; // gap-2
    const itemTotalHeight = rowHeight + gap;
    const totalHeight =
      items.length * itemTotalHeight - (items.length > 0 ? gap : 0);

    // Virtualize
    const containerHeight = 500; // Approx max height
    const scrollTop = this.liveRoomTableScrollTop;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemTotalHeight));
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemTotalHeight) + 1
    );
    const visibleItems = items.slice(startIndex, endIndex);

    return html`
      <div class="flex flex-col overflow-hidden max-h-[50vh]">
        <h1 class="flex-none text-sm text-gray-500 dark:text-gray-200 mb-1">
          已屏蔽直播间 <span class="text-sm">(${items.length})</span>
        </h1>

        <!-- Header -->
        <div
          class="flex-none flex items-center bg-gray-200 dark:bg-gray-800 text-center font-bold h-10 pr-2"
        >
          <div class="w-48 flex-none">屏蔽时间</div>
          <div class="flex-auto">所有者</div>
          <div class="w-32 flex-none"></div>
        </div>

        <div
          class="flex-1 overflow-auto relative"
          @scroll=${this.onLiveRoomTableScroll}
        >
          <div style="height: ${totalHeight}px; width: 100%;">
            ${visibleItems.map((item, index) => {
              const actualIndex = startIndex + index;
              const top = actualIndex * itemTotalHeight;
              const { id, owner, blockedAt } = item;
              return html`
                    <div 
                      class="absolute left-0 right-0 h-12 flex items-center bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition group"
                      style="top: ${top}px;"
                    >
                      <div class="w-48 flex-none text-right px-2 text-sm">
                        <time datetime="${blockedAt.toISOString()}">
                           ${blockedAt.toLocaleString()}
                        </time>
                      </div>
                      <div class="flex-auto text-center truncate px-2">
                        ${owner}
                      </div>
                      <div class="w-32 flex-none flex justify-center items-center space-x-2 opacity-0 group-hover:opacity-100 transition">
                         <a
                           href="https://live.bilibili.com/${id}"
                           target="_blank"
                           class="inline-flex items-center underline text-blue-500 text-sm"
                         >
                           <svg 
                             viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              class="h-[1.25em] mr-1"
                           >
                              <path fill-rule="evenodd" clip-rule="evenodd" d=${mdiOpenInNew} fill="currentColor">
                           </svg>
                           <span>前往</span>
                         </a>
                         <button
                           type="button"
                           @click=${() => {
                             blockedLiveRooms.remove(id);
                             this.dataVersion += 1;
                             this.render();
                           }}
                           class="inline-flex items-center underline text-sm"
                         >
                           <svg 
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              class="h-[1.25em] mr-1"
                           >
                             <path fill-rule="evenodd" clip-rule="evenodd" d=${mdiCheck} fill="currentColor">
                           </svg>
                           <span>取消屏蔽</span>
                         </button>
                      </div>
                    </div>
                `;
            })}
          </div>
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
