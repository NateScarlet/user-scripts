<script lang="ts">
  import SettingsDrawer from './SettingsDrawer';
  import { mdiEyeOffOutline } from '@mdi/js';

  interface Props {
    settings: SettingsDrawer;
  }
  let { settings }: Props = $props();
</script>

<div class="v-popover-wrap">
  <a
    href="javascript:void(0)"
    class="right-entry__item-trigger"
    onclick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      settings.open();
    }}
  >
    <div class="trigger-icon-wrap">
      <svg
        viewBox="2 2 20 20"
        class="trigger-icon"
        style="height: 20px; fill: currentColor;"
      >
        <path fill-rule="evenodd" clip-rule="evenodd" d={mdiEyeOffOutline} />
      </svg>
    </div>
    <span class="trigger-text">屏蔽</span>
  </a>
</div>
