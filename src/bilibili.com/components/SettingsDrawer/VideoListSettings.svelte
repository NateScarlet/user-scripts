<script lang="ts">
  import videoListSettings from '../../models/videoListSettings';
  import growTextAreaHeight from '../../../utils/growTextAreaHeight';

  // Duration Handlers
  let durationGte = $state(videoListSettings.durationGte.toTimeCode());
  let durationLt = $state(videoListSettings.durationLt.toTimeCode());

  $effect(() => {
    videoListSettings.durationGte = durationGte;
  });
  $effect(() => {
    videoListSettings.durationLt = durationLt;
  });

  // Excluded Keywords Logic
  // svelte 5 state
  let excludedKeywordsBuffer = $state<string | undefined>(undefined);

  // derived state is better handled by a simple expression in template or $derived if complex.
  // Here we want to sync store to buffer ONLY if buffer is undefined.
  // But $store is a reactive value.

  // We can use $derived for the display value
  let excludedKeywords = $derived(
    excludedKeywordsBuffer ??
      ($videoListSettings?.excludeKeywords ?? []).join('\n')
  );

  function updateExcludedKeywords(v: string) {
    excludedKeywordsBuffer = v;
    videoListSettings.excludeKeywords = v.split('\n');
  }
</script>

<section>
  <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
    视频列表
  </h2>
  <div class="space-y-4">
    <!-- Toggles -->
    <div class="space-y-3">
      <label class="flex items-center gap-3 cursor-pointer group">
        <input
          type="checkbox"
          class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
          checked={$videoListSettings?.allowAdvertisement ?? false}
          onchange={(e) => {
            videoListSettings.allowAdvertisement = e.currentTarget.checked;
          }}
        />
        <span
          class="text-gray-700 dark:text-gray-300 font-medium group-hover:text-black dark:group-hover:text-white transition-colors"
          >允许广告（非视频）</span
        >
      </label>
      <label class="flex items-center gap-3 cursor-pointer group">
        <input
          type="checkbox"
          class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
          checked={$videoListSettings?.allowPromoted ?? false}
          onchange={(e) => {
            videoListSettings.allowPromoted = e.currentTarget.checked;
          }}
        />
        <span
          class="text-gray-700 dark:text-gray-300 font-medium group-hover:text-black dark:group-hover:text-white transition-colors"
          >允许推广</span
        >
      </label>
    </div>

    <!-- Duration -->
    <div class="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
        时长限制
      </h3>
      <div class="grid grid-cols-2 gap-3">
        <label>
          <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
            最短（含）
          </div>
          <input
            class="
              w-full px-3 py-2 bg-white dark:bg-gray-800
              border border-gray-300 dark:border-gray-700 rounded-lg
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
              text-gray-900 dark:text-gray-100 placeholder-gray-400
              text-sm
            "
            type="text"
            placeholder="HH:MM:SS"
            bind:value={durationGte}
            onkeydown={(e) => e.stopPropagation()}
          />
        </label>
        <label>
          <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
            最长（不含）
          </div>
          <input
            class="
              w-full px-3 py-2 bg-white dark:bg-gray-800
              border border-gray-300 dark:border-gray-700 rounded-lg
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
              text-gray-900 dark:text-gray-100 placeholder-gray-400
              text-sm
            "
            type="text"
            placeholder="HH:MM:SS"
            bind:value={durationLt}
            onkeydown={(e) => e.stopPropagation()}
          />
        </label>
      </div>
    </div>

    <!-- Keywords -->
    <div class="space-y-2">
      <label
        class="block text-sm font-semibold text-gray-900 dark:text-gray-100"
      >
        排除关键词
        <span class="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2"
          >每行一个，不区分大小写</span
        >
      </label>
      <textarea
        class="
          w-full px-3 py-2 bg-white dark:bg-gray-800
          border border-gray-300 dark:border-gray-700 rounded-lg
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
          text-gray-900 dark:text-gray-100 placeholder-gray-400
          min-h-[100px] resize-y
        "
        placeholder="输入关键词..."
        value={excludedKeywords}
        oninput={(e) => {
          const el = e.currentTarget;
          updateExcludedKeywords(el.value);
          growTextAreaHeight(el);
        }}
        onkeydown={(e) => e.stopPropagation()}
        onfocus={(e) => growTextAreaHeight(e.currentTarget)}
        onblur={() => {
          excludedKeywordsBuffer = undefined;
        }}
      ></textarea>
      <div class="text-xs text-gray-500 dark:text-gray-400">
        不显示标题含这些关键词的视频。
      </div>
    </div>
  </div>
</section>
