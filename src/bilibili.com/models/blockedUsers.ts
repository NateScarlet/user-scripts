import GMValue from "@/utils/GMValue";

interface BlockedUser {
  name: string;
  blockedAt: number;
}

export default new (class {
  #value = new GMValue<Record<string, BlockedUser | true | undefined>>(
    "blockedUsers@206ceed9-b514-4902-ad70-aa621fed5cd4",
    () => ({})
  );

  has(id: string) {
    return id in this.#value.get();
  }

  get(id: string) {
    const value = this.#value.get()[id];
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
    return Object.keys(this.#value.get());
  }

  add({ id, name }: { id: string; name: string }) {
    if (this.has(id)) {
      return;
    }
    this.#value.set({
      ...this.#value.get(),
      [id]: {
        name: name.trim(),
        blockedAt: Date.now(),
      },
    });
  }

  remove(id: string) {
    if (!this.has(id)) {
      return;
    }
    this.#value.set({
      ...this.#value.get(),
      [id]: undefined,
    });
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
