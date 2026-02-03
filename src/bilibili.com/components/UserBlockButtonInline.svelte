<script lang="ts">
  import blockedUsers from '../models/blockedUsers';

  interface Props {
    user: { id: string };
  }
  let { user }: Props = $props();

  let isBlocked = $derived($blockedUsers && blockedUsers.has(user.id));
</script>

<span
  class="h-f-btn"
  onclick={(e) => {
    e.stopPropagation();
    blockedUsers.toggle({
      id: user.id,
      name:
        (document.querySelector('#h-name, .nickname') as HTMLElement)
          ?.innerText ?? '',
    });
  }}
>
  {isBlocked ? '取消屏蔽' : '屏蔽'}
</span>
