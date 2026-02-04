<script lang="ts">
  import { mdiClose } from '@mdi/js';
  import getCurrentTheme from '../../utils/getCurrentTheme';
  import HomePageSettings from './HomePageSettings.svelte';
  import SearchSettings from './SearchSettings.svelte';
  import VideoListSettings from './VideoListSettings.svelte';
  import BlockedUserPatternSettings from './BlockedUserPatternSettings.svelte';
  import BlockedUsersSettings from './BlockedUsersSettings.svelte';
  import BlockedLiveRoomsSettings from './BlockedLiveRoomsSettings.svelte';
  import { fade, fly } from 'svelte/transition';

  let isOpen = $state(false);

  export function open() {
    isOpen = true;
  }

  export function close() {
    isOpen = false;
  }
</script>

<!-- Backdrop -->
{#if isOpen}
  <div
    data-theme={getCurrentTheme()}
    class="
      fixed inset-0
      bg-black/40 backdrop-blur-sm
      cursor-zoom-out
      z-50
    "
    onclick={close}
    transition:fade={{ duration: 200 }}
    role="button"
    tabindex="-1"
  ></div>

  <div
    data-theme={getCurrentTheme()}
    class="
      fixed inset-y-0 right-0 w-full max-w-screen-2xl
      bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100
      shadow-2xl z-50 flex flex-col
    "
    transition:fly={{ x: '100%', duration: 300, opacity: 1 }}
  >
    <!-- Header -->
    <header
      class="
        flex-none flex items-center justify-between
        px-6 py-4
        border-b border-gray-200 dark:border-gray-800
      "
    >
      <h2 class="text-xl font-bold">设置</h2>
      <button
        type="button"
        class="
          p-2 rounded-full
          hover:bg-gray-100 dark:hover:bg-gray-800
          text-gray-500 dark:text-gray-400
          transition-colors
        "
        onclick={close}
        title="关闭"
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
    </header>

    <!-- Scrollable Content -->
    <div class="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        <!-- Column 1: General & Search -->
        <div class="space-y-6 lg:space-y-8">
          <div
            class="bg-gray-50 dark:bg-gray-900/30 rounded-2xl p-5 border border-gray-100 dark:border-gray-800"
          >
            <HomePageSettings />
          </div>
          <div
            class="bg-gray-50 dark:bg-gray-900/30 rounded-2xl p-5 border border-gray-100 dark:border-gray-800"
          >
            <SearchSettings />
          </div>
        </div>

        <!-- Column 2: Video List Settings -->
        <div
          class="bg-gray-50 dark:bg-gray-900/30 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 h-full"
        >
          <VideoListSettings />
        </div>

        <!-- Column 3: Patterns -->
        <div
          class="bg-gray-50 dark:bg-gray-900/30 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 h-full"
        >
          <BlockedUserPatternSettings />
        </div>
      </div>

      <!-- Bottom Lists Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mt-6 lg:mt-8">
        <div
          class="bg-gray-50 dark:bg-gray-900/30 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 min-w-0"
        >
          <BlockedUsersSettings />
        </div>
        <div
          class="bg-gray-50 dark:bg-gray-900/30 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 min-w-0"
        >
          <BlockedLiveRoomsSettings />
        </div>
      </div>

      <div class="h-8"></div>
    </div>
  </div>
{/if}
