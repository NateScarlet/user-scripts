<script lang="ts">
  import { mdiEyeOffOutline } from '@mdi/js';

  interface Props {
    onClick: () => void;
  }
  let { onClick }: Props = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  style="display: flex; align-items: center; margin: 0 20px; flex-direction: column; gap: 4px; padding: 12px; font-size: 14px; cursor: pointer; color: inherit;"
  onclick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  }}
>
  <svg viewBox="2 2 20 20" style="height: 20px; fill: currentColor;">
    <path fill-rule="evenodd" clip-rule="evenodd" d={mdiEyeOffOutline} />
  </svg>
  <span>屏蔽</span>
</div>
