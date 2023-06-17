import useGMValue from "@/utils/useGMValue";

interface BlockedUser {
  name: string;
  blockedAt: number;
}

const blockedUsers = useGMValue(
  "blockedUsers@206ceed9-b514-4902-ad70-aa621fed5cd4",
  {} as Record<string, BlockedUser | true | undefined>
);
export default new (class {
  has(id: string) {
    return id in blockedUsers;
  }

  get(id: string) {
    const value = blockedUsers.value[id];
    const { blockedAt: rawBlockedAt = 0, name = id } =
      typeof value === "boolean" ? {} : value ?? {};
    const blockedAt = new Date(rawBlockedAt);
    return {
      id,
      blockedAt,
      name,
      idAsNumber: Number.parseInt(id, 10),
      rawBlockedAt,
    };
  }

  distinctID() {
    return Object.keys(blockedUsers.value);
  }

  add({ id, name }: { id: string; name: string }) {
    if (id in blockedUsers.value) {
      return;
    }
    blockedUsers.value = {
      ...blockedUsers.value,
      [id]: {
        name: name.trim(),
        blockedAt: Date.now(),
      },
    };
  }

  remove(id: string) {
    if (!(id in blockedUsers.value)) {
      return;
    }
    blockedUsers.value = {
      ...blockedUsers.value,
      [id]: undefined,
    };
  }

  toggle(user: { id: string; name: string }, force?: boolean) {
    const want = force ?? !this.has(user.id);
    if (want) {
      this.add(user);
    } else {
      this.remove(user.id);
    }
  }
})();
