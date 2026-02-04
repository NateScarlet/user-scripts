<script lang="ts">
  import searchSettings from '../../models/searchSettings';
</script>

<section>
  <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">搜索</h2>
  <div class="space-y-4">
    <div
      class="p-3 -mx-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
    >
      <label
        class="flex items-start gap-3 cursor-pointer group pointer-events-auto"
      >
        <input
          type="checkbox"
          class="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
          checked={$searchSettings?.strictTitleMatch ?? false}
          onchange={(e) => {
            searchSettings.strictTitleMatch = e.currentTarget.checked;
          }}
        />
        <div>
          <div
            class="text-gray-900 dark:text-gray-100 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
          >
            严格标题匹配
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            标题必须包含所有关键词，屏蔽联想词和标签匹配
          </div>
        </div>
      </label>
    </div>

    <div
      class="p-3 -mx-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
    >
      <label
        class="flex items-start gap-3 cursor-pointer group pointer-events-auto"
      >
        <input
          type="checkbox"
          class="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
          checked={$searchSettings?.disableNavSuggestion ?? false}
          onchange={(e) => {
            searchSettings.disableNavSuggestion = e.currentTarget.checked;
          }}
        />
        <div>
          <div
            class="text-gray-900 dark:text-gray-100 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
          >
            禁用导航栏搜索建议
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            仅隐藏文本，不影响默认搜索行为
          </div>
        </div>
      </label>
    </div>
  </div>
</section>
