<script lang="ts">
  import homePageSettings from '../models/homePageSettings';
  import { mdiEyeOff } from '@mdi/js';

  interface Props {
    floorCard: { channel: string };
  }
  let { floorCard = $bindable() }: Props = $props();

  export function setFloorCard(f: Props['floorCard']) {
    floorCard = f;
  }
</script>

<button
  type="button"
  title="屏蔽此频道的楼层卡片"
  class="absolute top-2 left-2 rounded-md cursor-pointer text-white bg-[rgba(33,33,33,.8)] z-20 border-none"
  onclick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    homePageSettings.floorCard.excludeByChannel = [
      ...homePageSettings.floorCard.excludeByChannel,
      floorCard.channel,
    ];
  }}
>
  <svg viewBox="-2 -2 28 28" class="h-7 fill-current">
    <path fill-rule="evenodd" clip-rule="evenodd" d={mdiEyeOff} />
  </svg>
</button>
