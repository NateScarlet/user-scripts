<script lang="ts">
  import blockedUserPatterns from '../../models/blockedUserPatterns';
  import growTextAreaHeight from '../../../utils/growTextAreaHeight';

  let blockedUserPatternsBuffer = $state<string | undefined>(undefined);

  // blockedUserPatterns store returns the array of patterns directly
  let patternsList = $derived($blockedUserPatterns ?? []);
  let patternsText = $derived(
    blockedUserPatternsBuffer ?? patternsList.map((i) => i.pattern).join('\n')
  );

  function updatePatterns(v: string) {
    blockedUserPatternsBuffer = v;
    blockedUserPatterns.set(
      v
        .split('\n')
        .map((i) => i.trim())
        .filter((i) => i)
    );
  }
</script>

<section>
  <h1 class="text-sm text-gray-500 dark:text-gray-200">屏蔽名称匹配的用户</h1>
  <div class="px-1">
    <textarea
      class="w-full border my-1 p-1 dark:bg-gray-800 dark:text-white dark:border-gray-500"
      placeholder=""
      value={patternsText}
      oninput={(e) => {
        const el = e.currentTarget;
        updatePatterns(el.value);
        growTextAreaHeight(el);
      }}
      onkeydown={(e) => e.stopPropagation()}
      onfocus={(e) => growTextAreaHeight(e.currentTarget)}
      onblur={() => {
        blockedUserPatternsBuffer = undefined;
      }}
    ></textarea>
    <div class="text-gray-500 dark:text-gray-200 text-sm">
      每行一个，支持正则。
    </div>
  </div>
</section>
