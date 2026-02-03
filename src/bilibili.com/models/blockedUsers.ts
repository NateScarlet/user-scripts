import GMValue from '@/utils/GMValue';

interface BlockedUser {
  name: string;
  blockedAt: number;
  note?: string;
}

export default new (class {
  private readonly value = new GMValue<
    Record<string, BlockedUser | true | undefined>
  >('blockedUsers@206ceed9-b514-4902-ad70-aa621fed5cd4', () => ({}));

  public readonly has = (id: string) => {
    return id in this.value.get();
  };

  public readonly subscribe = (
    run: (
      value: Record<string, BlockedUser | true | undefined> | undefined
    ) => void
  ) => {
    return this.value.subscribe(run);
  };

  public readonly get = (id: string) => {
    const value = this.value.get()[id];
    if (!value) {
      return;
    }
    const {
      blockedAt: rawBlockedAt = 0,
      name = id,
      note = '',
    } = typeof value === 'boolean' ? {} : (value ?? {});
    const blockedAt = new Date(rawBlockedAt);
    return {
      id,
      blockedAt,
      name,
      idAsNumber: Number.parseInt(id, 10),
      rawBlockedAt,
      note,
    };
  };

  public readonly distinctID = () => {
    return Object.keys(this.value.get());
  };

  public readonly add = ({
    id,
    name,
    note,
  }: {
    id: string;
    name: string;
    note?: string;
  }) => {
    if (this.has(id)) {
      return;
    }
    this.value.set({
      ...this.value.get(),
      [id]: {
        name: name.trim(),
        blockedAt: Date.now(),
        note: note || undefined,
      },
    });
  };

  public readonly update = (
    id: string,
    update: Partial<Omit<BlockedUser, 'id'>>
  ) => {
    const existing = this.get(id);
    if (existing) {
      this.value.set({
        ...this.value.get(),
        [id]: {
          name: update.name || existing.name,
          blockedAt: update.blockedAt || existing.blockedAt.getTime(),
          note: (update.note ?? existing.note) || undefined,
        },
      });
    }
  };

  public readonly remove = (id: string) => {
    if (!this.has(id)) {
      return;
    }
    this.value.set(
      Object.fromEntries(
        Object.entries(this.value.get()).filter(([k]) => k !== id)
      )
    );
  };

  public toggle = (user: { id: string; name: string }, force?: boolean) => {
    const want = force ?? !this.has(user.id);
    if (want) {
      this.add(user);
    } else {
      this.remove(user.id);
    }
  };
})();
