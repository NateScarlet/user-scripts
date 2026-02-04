<script lang="ts">
  import { mdiClose } from '@mdi/js';
  import homePageSettings from '../../models/homePageSettings';
</script>

<section>
  <h1 class="text-sm text-gray-500 dark:text-gray-200">主页</h1>
  <div class="px-1">
    <label>
      <input
        type="checkbox"
        checked={$homePageSettings?.allowAdblockTips ?? false}
        onchange={(e) => {
          homePageSettings.allowAdblockTips = e.currentTarget.checked;
        }}
      />
      <span>允许</span>
      <span
        class="text-sm rounded"
        style="
          color: #e58900;
          background-color: #fff0e3;
        ">检测到您的页面...</span
      >
      <span>提示</span>
    </label>
    <section>
      <h2 class="text-gray-500 dark:text-gray-200 text-sm">楼层推广卡片</h2>
      <div class="px-1">
        <div>
          <label>
            <input
              type="checkbox"
              checked={$homePageSettings?.floorCard?.excludeAll ?? false}
              onchange={(e) => {
                homePageSettings.floorCard.excludeAll = e.currentTarget.checked;
              }}
            />
            <span>屏蔽所有</span>
          </label>
        </div>

        {#if !($homePageSettings?.floorCard?.excludeAll ?? false)}
          {#if ($homePageSettings?.floorCard?.excludeByChannel ?? []).length === 0}
            <div class="text-gray-500 dark:text-gray-200 text-sm">
              可通过指针悬停在卡片上时左上角显示的按钮来屏蔽单个频道的推广
            </div>
          {:else}
            <div>
              <h2 class="flex-none text-sm text-gray-500 dark:text-gray-200">
                已屏蔽频道 <span class="text-sm"
                  >({($homePageSettings?.floorCard?.excludeByChannel ?? [])
                    .length})</span
                >
              </h2>
              <ol class="flex flex-wrap gap-2 items-center">
                {#each $homePageSettings?.floorCard?.excludeByChannel ?? [] as channel (channel)}
                  <li
                    class="bg-gray-300 dark:bg-gray-700 rounded px-1 flex items-center"
                  >
                    <span>{channel}</span>
                    <button
                      type="button"
                      onclick={() => {
                        homePageSettings.floorCard.excludeByChannel =
                          homePageSettings.floorCard.excludeByChannel.filter(
                            (i: string) => i !== channel
                          );
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-[1.25em]"
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
    </section>
  </div>
</section>
