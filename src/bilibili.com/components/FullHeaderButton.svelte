<script lang="ts">
  import SettingsDrawer from './SettingsDrawer';
  import { mdiEyeOffOutline } from '@mdi/js';

  interface Props {
    settings: SettingsDrawer;
  }
  let { settings }: Props = $props();
</script>

<button
  type="button"
  class="right-entry__outside"
  onclick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    settings.open();
  }}
>
  <svg
    viewBox="2 2 20 20"
    class="right-entry-icon"
    style="height: 20px; fill: currentColor;"
  >
    <path fill-rule="evenodd" clip-rule="evenodd" d={mdiEyeOffOutline} />
  </svg>
  <span class="right-entry-text">屏蔽</span>
</button>
