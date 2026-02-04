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
  <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
    屏蔽名称匹配的用户
  </h2>
  <div class="space-y-2">
    <div class="relative">
      <textarea
        class="
          w-full px-3 py-2 bg-white dark:bg-gray-800
          border border-gray-300 dark:border-gray-700 rounded-lg
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
          text-gray-900 dark:text-gray-100 placeholder-gray-400
          min-h-[100px] resize-y
        "
        placeholder="输入匹配规则..."
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
    </div>
    <div class="text-xs text-gray-500 dark:text-gray-400">
      每行一个，支持正则表达式。
    </div>
  </div>
</section>
