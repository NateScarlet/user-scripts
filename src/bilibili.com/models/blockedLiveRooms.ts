import GMValue from '@/utils/GMValue';

interface Value {
  owner: string;
  blockedAt: number;
}

interface RoomInput {
  id: string;
  owner: string;
}

export default new (class {
  private readonly value = new GMValue<Record<string, Value | undefined>>(
    'blockedLiveRooms@031f022e-51b9-4361-8cfb-80263a0d7595',
    () => ({})
  );

  public readonly has = (id: string) => {
    return !!this.value.get()[id];
  };

  public readonly subscribe = (
    run: (value: Record<string, Value | undefined> | undefined) => void
  ) => {
    return this.value.subscribe(run);
  };

  public readonly get = (id: string) => {
    const value = this.value.get()[id]!;
    return {
      id,
      blockedAt: new Date(value.blockedAt),
      owner: value.owner,
    };
  };

  public readonly distinctID = () => {
    return Object.keys(this.value.get());
  };

  public readonly add = ({ id, owner }: RoomInput) => {
    if (this.has(id)) {
      return;
    }
    this.value.set({
      ...this.value.get(),
      [id]: {
        owner: owner.trim(),
        blockedAt: Date.now(),
      },
    });
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

  public toggle = (room: RoomInput, force?: boolean) => {
    const want = force ?? !this.has(room.id);
    if (want) {
      this.add(room);
    } else {
      this.remove(room.id);
    }
  };
})();
