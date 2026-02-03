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
  <h1 class="text-sm text-gray-500 dark:text-gray-200">视频列表</h1>
  <div class="px-1">
    <label>
      <input
        type="checkbox"
        checked={$videoListSettings?.allowAdvertisement ?? false}
        onchange={(e) => {
          videoListSettings.allowAdvertisement = e.currentTarget.checked;
        }}
      />
      <span>允许广告（非视频）</span>
    </label>
    <label>
      <input
        type="checkbox"
        checked={$videoListSettings?.allowPromoted ?? false}
        onchange={(e) => {
          videoListSettings.allowPromoted = e.currentTarget.checked;
        }}
      />
      <span>允许推广</span>
    </label>
    <label class="flex items-center">
      <span class="flex-none w-32">最短（含）</span>
      <input
        class="flex-auto border my-1 p-1 dark:bg-gray-800 dark:text-white dark:border-gray-500"
        type="text"
        placeholder="HH:MM:SS"
        bind:value={durationGte}
        onkeydown={(e) => e.stopPropagation()}
      />
    </label>
    <label class="flex items-center">
      <span class="flex-none w-32">最长（不含）</span>
      <input
        class="flex-auto border my-1 p-1 dark:bg-gray-800 dark:text-white dark:border-gray-500"
        type="text"
        placeholder="HH:MM:SS"
        bind:value={durationLt}
        onkeydown={(e) => e.stopPropagation()}
      />
    </label>
    <label class="flex items-center">
      <div class="flex-none w-32">排除关键词</div>
      <div class="flex-auto">
        <textarea
          class="w-full border my-1 p-1 dark:bg-gray-800 dark:text-white dark:border-gray-500"
          placeholder=""
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
        <div class="text-gray-500 dark:text-gray-200 text-sm">
          不显示标题含关键词的视频。每行一个，不区分大小写。
        </div>
      </div>
    </label>
  </div>
</section>
