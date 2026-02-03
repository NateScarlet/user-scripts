<script lang="ts">
  import { mdiClose } from '@mdi/js';
  import getCurrentTheme from '../../utils/getCurrentTheme';
  import HomePageSettings from './HomePageSettings.svelte';
  import SearchSettings from './SearchSettings.svelte';
  import VideoListSettings from './VideoListSettings.svelte';
  import BlockedUserPatternsSettings from './BlockedUserPatternsSettings.svelte';
  import UserTable from './UserTable.svelte';
  import LiveRoomTable from './LiveRoomTable.svelte';
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
      bg-white/25 dark:bg-black/25 backdrop-blur
      cursor-zoom-out
    "
    onclick={close}
    transition:fade={{ duration: 200 }}
    role="button"
    tabindex="-1"
  ></div>

  <div
    data-theme={getCurrentTheme()}
    class="
      fixed inset-y-0 right-0 w-screen max-w-4xl
      bg-white text-black dark:bg-black dark:text-white overflow-auto p-2 space-y-1
    "
    transition:fly={{ x: 1000, duration: 200 }}
  >
    <button
      type="button"
      class="lg:hidden self-end flex items-center"
      onclick={close}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="h-[1.25em] align-top"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d={mdiClose}
          fill="currentColor"
        >
        </path>
      </svg>
      <span>关闭</span>
    </button>

    <HomePageSettings />
    <SearchSettings />
    <VideoListSettings />
    <BlockedUserPatternsSettings />
    <UserTable />
    <LiveRoomTable />
  </div>
{/if}
