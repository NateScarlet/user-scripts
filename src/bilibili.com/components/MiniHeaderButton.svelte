<script lang="ts">
  import SettingsDrawer from './SettingsDrawer';

  interface Props {
    settings: SettingsDrawer;
  }
  let { settings }: Props = $props();
</script>

<div
  class="item"
  onclick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    settings.open();
  }}
>
  <span class="name">屏蔽</span>
</div>
