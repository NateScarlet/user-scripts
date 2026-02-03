<script lang="ts">
  import blockedUsers from '../models/blockedUsers';

  interface Props {
    user: { id: string };
  }
  let { user }: Props = $props();

  let isBlocked = $derived($blockedUsers && blockedUsers.has(user.id));
</script>

<span>
  {isBlocked ? '取消屏蔽' : '屏蔽'}
</span>
