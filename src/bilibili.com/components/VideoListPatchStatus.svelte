<script lang="ts">
  import getCurrentTheme from '../utils/getCurrentTheme';
  import type { Writable } from 'svelte/store';

  interface State {
    matchCount: number;
    disabled: boolean;
  }

  interface Props {
    stateStore: Writable<State>;
    onToggle: () => void;
  }

  let { stateStore, onToggle }: Props = $props();

  // Subscribe to store
  // $stateStore works in Svelte 5 if store is compatible
</script>

{#if $stateStore.matchCount > 0}
  <div
    data-theme={getCurrentTheme()}
    class="w-full text-gray-500 dark:text-gray-400 text-center m-1"
  >
    {#if $stateStore.disabled}
       {$stateStore.matchCount} 条视频符合屏蔽规则
    {:else}
       已屏蔽 {$stateStore.matchCount} 条视频
    {/if}
    <button
      type="button"
      class="border rounded py-1 px-2 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition ease-in-out duration-200"
      onclick={onToggle}
    >
      {$stateStore.disabled ? '屏蔽' : '全部显示'}
    </button>
  </div>
{/if}
