<script lang="ts">
  import { mdiCheck, mdiOpenInNew } from '@mdi/js';
  import blockedLiveRooms from '../../models/blockedLiveRooms';
  import compare from '../../../utils/compare';

  // Derived state: sorted items
  let items = $derived.by(() => {
    // Access store to subscribe
    void $blockedLiveRooms;

    return blockedLiveRooms
      .distinctID()
      .map(blockedLiveRooms.get)
      .sort((a, b) => {
        const dateCompare = compare(a.blockedAt, b.blockedAt);
        if (dateCompare !== 0) {
          return -dateCompare;
        }
        return compare(a.id, b.id);
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
</script>

<div class="space-y-4">
  <h2 class="flex-none text-lg font-bold text-gray-900 dark:text-gray-100">
    已屏蔽直播间 <span
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
      <div class="flex-auto">所有者</div>
      <div class="w-48 flex-none">操作</div>
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
              <time datetime={item.blockedAt.toISOString()}>
                {item.blockedAt.toLocaleString()}
              </time>
            </div>
            <div
              class="flex-auto text-center truncate px-4 font-medium text-gray-900 dark:text-gray-100"
            >
              {item.owner}
            </div>
            <div
              class="w-48 flex-none flex justify-center items-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <a
                href="https://live.bilibili.com/{item.id}"
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
                <span>前往</span>
              </a>
              <button
                type="button"
                onclick={() => {
                  blockedLiveRooms.remove(item.id);
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
                    d={mdiCheck}
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
