<script lang="ts">
  import { mdiCheck, mdiOpenInNew } from '@mdi/js';
  import blockedLiveRooms from '../../models/blockedLiveRooms';
  import compare from '../../../utils/compare';

  // Derived state: sorted items
  let items = $derived.by(() => {
    // Access store to subscribe
    const _ = $blockedLiveRooms;
    
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
  const containerHeight = 500;
  
  let totalHeight = $derived(items.length * itemTotalHeight - (items.length > 0 ? gap : 0));
  let startIndex = $derived(Math.max(0, Math.floor(scrollTop / itemTotalHeight)));
  let endIndex = $derived(Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemTotalHeight) + 1
  ));
  let visibleItems = $derived(items.slice(startIndex, endIndex).map((item, index) => ({
    ...item,
    top: (startIndex + index) * itemTotalHeight
  })));

  function handleScroll(e: UIEvent) {
    scrollTop = (e.target as HTMLElement).scrollTop;
  }
</script>

<div class="flex flex-col overflow-hidden max-h-[50vh]">
  <h1 class="flex-none text-sm text-gray-500 dark:text-gray-200 mb-1">
    已屏蔽直播间 <span class="text-sm">({items.length})</span>
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
    onscroll={handleScroll}
  >
    <div style="height: {totalHeight}px; width: 100%;">
      {#each visibleItems as item (item.id)}
        <div 
          class="absolute left-0 right-0 h-12 flex items-center bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition group"
          style="top: {item.top}px;"
        >
          <div class="w-48 flex-none text-right px-2 text-sm">
            <time datetime={item.blockedAt.toISOString()}>
               {item.blockedAt.toLocaleString()}
            </time>
          </div>
          <div class="flex-auto text-center truncate px-2">
            {item.owner}
          </div>
          <div class="w-32 flex-none flex justify-center items-center space-x-2 opacity-0 group-hover:opacity-100 transition">
             <a
               href="https://live.bilibili.com/{item.id}"
               target="_blank"
               class="inline-flex items-center underline text-blue-500 text-sm"
             >
               <svg 
                 viewBox="0 0 24 24"
                 fill="none"
                 xmlns="http://www.w3.org/2000/svg"
                 class="h-[1.25em] mr-1"
               >
                 <path fill-rule="evenodd" clip-rule="evenodd" d={mdiOpenInNew} fill="currentColor">
                 </path>
               </svg>
               <span>前往</span>
             </a>
             <button
               type="button"
               onclick={() => {
                 blockedLiveRooms.remove(item.id);
               }}
               class="inline-flex items-center underline text-sm"
             >
               <svg 
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-[1.25em] mr-1"
               >
                 <path fill-rule="evenodd" clip-rule="evenodd" d={mdiCheck} fill="currentColor">
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
