<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import getCurrentTheme from '../utils/getCurrentTheme';
  import { mdiClose } from '@mdi/js';
  import { onMount, untrack } from 'svelte';

  interface Props {
    title?: string;
    label?: string;
    value?: string;
    placeholder?: string;
    actionText?: string;
    onClose: (result: string | null) => void;
  }

  let {
    title = '编辑',
    label = '',
    value = $bindable(''),
    placeholder = '',
    actionText = '保存',
    onClose,
  }: Props = $props();

  let visible = $state(true);
  let pendingResult: string | null = null;

  // Svelte 5 建议 bind:this 的变量也使用 $state
  let dialogEl = $state<HTMLDivElement>();
  let inputEl = $state<HTMLInputElement>();

  onMount(() => {
    if (inputEl) {
      inputEl.select();
      inputEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  function close(v: string | null) {
    pendingResult = v;
    visible = false;
  }

  function handleOutroEnd() {
    onClose(pendingResult);
  }
</script>

{#if visible}
  <!-- Backdrop -->

  <div
    data-theme={getCurrentTheme()}
    class="
      fixed inset-0
      bg-black/25 dark:bg-white/25 backdrop-blur-sm
      flex items-center justify-center p-4
    "
    transition:fade={{ duration: 300 }}
    onoutroend={handleOutroEnd}
    role="dialog"
    aria-modal="true"
    onclick={(e) => {
      if (e.target === e.currentTarget) close(null);
    }}
  >
    <div
      data-theme={getCurrentTheme()}
      class="
        bg-white text-black dark:bg-black dark:text-white rounded-lg shadow-xl w-full max-w-lg
      "
      transition:fly={{ y: 24, duration: 300 }}
      bind:this={dialogEl}
      onclick={(e) => e.stopPropagation()}
      role="document"
    >
      <form
        onsubmit={(e) => {
          e.preventDefault();
          close(value);
        }}
      >
        <div class="border-b px-4 py-3 flex justify-between items-center">
          <h3 class="text-lg font-medium">{title}</h3>
          <button
            type="button"
            class="p-1 rounded-full hover:bg-gray-100 dark:hover:gray-900 transition-colors"
            onclick={() => close(null)}
            title="关闭"
            aria-label="关闭"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
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
        </div>
        <div class="p-4">
          {#if label}
            <label for="dialog-input" class="block text-sm font-medium mb-1">
              {label}
            </label>
          {/if}
          <input
            id="dialog-input"
            bind:this={inputEl}
            class="
              w-full p-2 border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-500 rounded-md
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              focus:outline-none shadow-sm
            "
            type="text"
            bind:value
            {placeholder}
          />
        </div>
        <div class="border-t px-4 py-3 flex justify-end gap-2">
          <button
            type="button"
            class="
              px-4 py-2 rounded-md text-sm font-medium
              bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors
            "
            onclick={() => close(null)}
          >
            取消
          </button>
          <button
            type="submit"
            class="
              px-4 py-2 rounded-md text-sm font-medium text-white
              bg-blue-600 hover:bg-blue-700 transition-colors
            "
          >
            {actionText}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
