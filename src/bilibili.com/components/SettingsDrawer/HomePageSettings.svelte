<script lang="ts">
  import { mdiClose } from '@mdi/js';
  import homePageSettings from '../../models/homePageSettings';
</script>

<section>
  <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">主页</h2>
  <div class="space-y-4">
    <label class="flex items-start gap-3 cursor-pointer group">
      <input
        type="checkbox"
        class="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
        checked={$homePageSettings?.allowAdblockTips ?? false}
        onchange={(e) => {
          homePageSettings.allowAdblockTips = e.currentTarget.checked;
        }}
      />
      <div class="select-none">
        <span
          class="text-gray-700 dark:text-gray-300 font-medium group-hover:text-black dark:group-hover:text-white transition-colors"
          >允许</span
        >
        <span
          class="text-xs px-1.5 py-0.5 rounded font-medium mx-1"
          style="
            color: #e58900;
            background-color: #fff0e3;
          ">检测到您的页面...</span
        >
        <span
          class="text-gray-700 dark:text-gray-300 font-medium group-hover:text-black dark:group-hover:text-white transition-colors"
          >提示</span
        >
      </div>
    </label>

    <div
      class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
    >
      <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
        楼层推广卡片
      </h3>

      <div class="space-y-3">
        <label class="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
            checked={$homePageSettings?.floorCard?.excludeAll ?? false}
            onchange={(e) => {
              homePageSettings.floorCard.excludeAll = e.currentTarget.checked;
            }}
          />
          <span
            class="text-gray-700 dark:text-gray-300 font-medium group-hover:text-black dark:group-hover:text-white transition-colors"
            >屏蔽所有</span
          >
        </label>

        {#if !($homePageSettings?.floorCard?.excludeAll ?? false)}
          {#if ($homePageSettings?.floorCard?.excludeByChannel ?? []).length === 0}
            <div class="text-gray-500 dark:text-gray-400 text-sm italic py-1">
              可通过指针悬停在卡片上时左上角显示的按钮来屏蔽单个频道的推广
            </div>
          {:else}
            <div>
              <div class="text-sm text-gray-500 dark:text-gray-400 mb-2">
                已屏蔽频道 <span
                  class="font-mono bg-gray-200 dark:bg-gray-700 px-1.5 rounded-md text-xs text-gray-700 dark:text-gray-300 ml-1"
                >
                  {($homePageSettings?.floorCard?.excludeByChannel ?? [])
                    .length}
                </span>
              </div>
              <ol class="flex flex-wrap gap-2 items-center">
                {#each $homePageSettings?.floorCard?.excludeByChannel ?? [] as channel (channel)}
                  <li
                    class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md pl-2 pr-1 py-1 flex items-center shadow-sm"
                  >
                    <span class="text-sm text-gray-700 dark:text-gray-300"
                      >{channel}</span
                    >
                    <button
                      type="button"
                      class="ml-1 p-0.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-colors"
                      onclick={() => {
                        homePageSettings.floorCard.excludeByChannel =
                          homePageSettings.floorCard.excludeByChannel.filter(
                            (i: string) => i !== channel
                          );
                      }}
                      title="移除"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d={mdiClose}
                          fill="currentColor"
                        >
                        </path>
                      </svg>
                    </button>
                  </li>
                {/each}
              </ol>
            </div>
          {/if}
        {/if}
      </div>
    </div>
  </div>
</section>
