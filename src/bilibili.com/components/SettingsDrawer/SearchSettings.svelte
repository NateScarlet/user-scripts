<script lang="ts">
  import searchSettings from '../../models/searchSettings';

  void searchSettings;
</script>

<section>
  <h1 class="text-sm text-gray-500 dark:text-gray-200">搜索</h1>
  <div class="px-1">
    <label>
      <input
        type="checkbox"
        checked={$searchSettings?.strictTitleMatch ?? false}
        onchange={(e) => {
          searchSettings.strictTitleMatch = e.currentTarget.checked;
        }}
      />
      <span>严格标题匹配</span>
    </label>
    <div class="text-gray-500 dark:text-gray-200 text-sm">
      标题必须包含所有关键词，屏蔽联想词和标签匹配
    </div>
  </div>
  <div class="px-1">
    <label>
      <input
        type="checkbox"
        checked={$searchSettings?.disableNavSuggestion ?? false}
        onchange={(e) => {
          searchSettings.disableNavSuggestion = e.currentTarget.checked;
        }}
      />
      <span>禁用导航栏搜索建议</span>
    </label>
    <div class="text-gray-500 dark:text-gray-200 text-sm">
      仅隐藏文本，不影响默认搜索行为
    </div>
  </div>
</section>
