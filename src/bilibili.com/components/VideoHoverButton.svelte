<script lang="ts">
  import { mdiAccountCheckOutline, mdiAccountCancelOutline } from '@mdi/js';
  import blockedUsers from '../models/blockedUsers';

  interface Props {
    user: { id: string; name: string; note: string };
  }

  let { user = $bindable() }: Props = $props();

  export function setUser(u: Props['user']) {
    user = u;
  }

  let isBlocked = $derived($blockedUsers && blockedUsers.has(user.id));
</script>

<button
  type="button"
  title={isBlocked ? '取消屏蔽此用户' : '屏蔽此用户'}
  class="rounded-md cursor-pointer z-20 border-none {isBlocked
    ? 'bg-white text-black'
    : 'text-white bg-[rgba(33,33,33,.8)]'}"
  onclick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBlocked) {
      blockedUsers.remove(user.id);
    } else {
      blockedUsers.add(user);
    }
  }}
>
  <svg viewBox="-3 -1 28 28" class="h-7 fill-current">
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d={isBlocked ? mdiAccountCheckOutline : mdiAccountCancelOutline}
    >
    </path>
  </svg>
</button>
