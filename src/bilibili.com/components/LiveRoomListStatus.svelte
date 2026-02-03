<script lang="ts">
  import type { Writable } from 'svelte/store';

  interface Props {
    matchCountStore: Writable<number>;
    disabledStore: Writable<boolean>;
    onToggleDisabled: () => void;
  }

  let { matchCountStore, disabledStore, onToggleDisabled }: Props = $props();

  let matchCount = $derived($matchCountStore);
  let disabled = $derived($disabledStore);

  let isHovered = $state(false);
</script>

{#if matchCount > 0}
  <div
    style="width: 100%; color: #6b7280; text-align: center; margin: 4px; font-size: 14px;"
  >
    {disabled
      ? `${matchCount} 个直播间符合屏蔽规则`
      : `已屏蔽 ${matchCount} 个直播间`}
    <button
      type="button"
      style="border: 1px solid #e5e7eb; border-radius: 4px; padding: 4px 8px; color: black; background-color: {isHovered
        ? '#f3f4f6'
        : 'transparent'}; transition: background-color 0.2s ease-in-out; cursor: pointer; margin-left: 8px;"
      onclick={onToggleDisabled}
      onmouseenter={() => (isHovered = true)}
      onmouseleave={() => (isHovered = false)}
    >
      {disabled ? '屏蔽' : '全部显示'}
    </button>
  </div>
{/if}
