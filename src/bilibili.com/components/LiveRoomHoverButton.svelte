<script lang="ts">
  import blockedLiveRooms from '../models/blockedLiveRooms';
  import { mdiCancel, mdiCheckCircleOutline } from '@mdi/js';

  interface Props {
    room: { id: string; owner: string };
  }
  let { room = $bindable() }: Props = $props();

  export function setRoom(r: Props['room']) {
    room = r;
  }

  let isBlocked = $derived($blockedLiveRooms && blockedLiveRooms.has(room.id));
</script>

<button
  type="button"
  title={isBlocked ? '取消屏蔽此直播间' : '屏蔽此直播间'}
  class="absolute top-2 left-2 p-1 rounded-md cursor-pointer isolate border-none {isBlocked
    ? 'bg-white text-black'
    : 'text-white bg-[rgba(33,33,33,.8)]'}"
  style="z-index: 200;"
  onclick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    blockedLiveRooms.toggle(room, !isBlocked);
  }}
>
  <svg viewBox="0 0 24 24" class="h-8 fill-current">
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d={isBlocked ? mdiCheckCircleOutline : mdiCancel}
    />
  </svg>
</button>
