<script lang="ts">
  import { mdiAccountCheckOutline, mdiOpenInNew } from '@mdi/js';
  import blockedUsers from '../../models/blockedUsers';
  import compare from '../../../utils/compare';
  import isNonNull from '../../../utils/isNonNull';
  import PromptDialog from './PromptDialog.svelte';

  // Derived state: sorted items
  // using $derived and accessing $blockedUsers
  // We need to access $blockedUsers to make it reactive
  let items = $derived.by(() => {
    // Access $blockedUsers to subscribe
    void $blockedUsers;

    return blockedUsers
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
  });

  // Virtualization state
  let scrollTop = $state(0);
  const rowHeight = 48; // h-12
  const gap = 8; // gap-2
  const itemTotalHeight = rowHeight + gap;
  const containerHeight = 600;

  let totalHeight = $derived(
    items.length * itemTotalHeight - (items.length > 0 ? gap : 0)
  );
  let startIndex = $derived(
    Math.max(0, Math.floor(scrollTop / itemTotalHeight))
  );
  let endIndex = $derived(
    Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemTotalHeight) + 1
    )
  );
  let visibleItems = $derived(
    items.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      top: (startIndex + index) * itemTotalHeight,
    }))
  );

  function handleScroll(e: UIEvent) {
    scrollTop = (e.target as HTMLElement).scrollTop;
  }

  let editingItem = $state<(typeof items)[number] | null>(null);
</script>

<div class="space-y-4">
  <h2 class="flex-none text-lg font-bold text-gray-900 dark:text-gray-100">
    已屏蔽用户 <span
      class="text-sm font-normal text-gray-500 dark:text-gray-400"
      >({items.length})</span
    >
  </h2>

  <div
    class="flex flex-col overflow-hidden max-h-[600px] border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 shadow-sm"
  >
    <!-- Header -->
    <div
      class="flex-none flex items-center bg-gray-50 dark:bg-gray-950/50 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 h-10 pr-2 border-b border-gray-200 dark:border-gray-800"
    >
      <div class="w-48 flex-none">屏蔽时间</div>
      <div class="flex-auto">名称</div>
      <div class="w-64 flex-none">操作</div>
    </div>

    <div
      class="flex-1 overflow-auto relative custom-scrollbar"
      onscroll={handleScroll}
    >
      <div style="height: {totalHeight}px; width: 100%;">
        {#each visibleItems as item (item.id)}
          <div
            class="absolute left-0 right-0 h-12 flex items-center bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800/50 last:border-0 group"
            style="top: {item.top}px;"
          >
            <div
              class="w-48 flex-none text-right px-4 text-xs text-gray-500 dark:text-gray-400 font-mono"
            >
              {#if item.rawBlockedAt}
                <time datetime={item.blockedAt.toISOString()}>
                  {item.blockedAt.toLocaleString()}
                </time>
              {/if}
            </div>

            <div
              class="flex-auto text-center cursor-pointer px-4 truncate font-medium text-gray-900 dark:text-gray-100"
              role="button"
              onclick={() => {
                editingItem = item;
              }}
            >
              <span class="hover:underline">{item.name}</span>
              <div
                class="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5"
                title={item.note}
              >
                {item.note}
              </div>
            </div>

            <div
              class="w-64 flex-none flex justify-center items-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <a
                href="https://space.bilibili.com/{item.id}"
                target="_blank"
                class="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-medium"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 mr-1"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d={mdiOpenInNew}
                    fill="currentColor"
                  >
                  </path>
                </svg>
                <span>个人空间</span>
              </a>
              <button
                type="button"
                onclick={() => {
                  blockedUsers.remove(item.id);
                }}
                class="inline-flex items-center text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs font-medium"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 mr-1"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d={mdiAccountCheckOutline}
                    fill="currentColor"
                  >
                  </path>
                </svg>
                <span>取消屏蔽</span>
              </button>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

{#if editingItem}
  <PromptDialog
    title="编辑备注"
    label={`为 ${editingItem.name} 添加备注:`}
    value={editingItem.note}
    placeholder="输入备注..."
    actionText="保存备注"
    onClose={(v) => {
      if (editingItem && v != null) {
        blockedUsers.update(editingItem.id, {
          note: v,
        });
      }
      editingItem = null;
    }}
  />
{/if}
