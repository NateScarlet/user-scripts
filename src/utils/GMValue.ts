import Polling from "./Polling";

export default class GMValue<T> {
  #key: string;

  #value: T | undefined;

  #defaultValue: () => T;

  #loadingCount = 0;

  #currentAction: Promise<void> | undefined;

  #polling: Polling;

  constructor(key: string, defaultValue: () => T) {
    this.#key = key;
    this.#defaultValue = defaultValue;
    this.#polling = new Polling({
      update: () => this.refresh(),
      scheduleNext: (update) => setTimeout(update, 500),
    });
  }

  get isLoading() {
    return this.#loadingCount > 0;
  }

  async #refresh() {
    const value = await GM.getValue(this.#key);
    if (value != null) {
      try {
        this.#value = JSON.parse(String(value));
      } catch {
        this.#value = undefined;
      }
    }
  }

  async refresh() {
    if (this.isLoading) {
      await this.#currentAction;
      return;
    }

    this.#loadingCount += 1;
    this.#currentAction = (async () => {
      try {
        this.#refresh();
      } finally {
        this.#loadingCount -= 1;
      }
    })();
    await this.#currentAction;
  }

  async #flush() {
    if (this.#value == null) {
      await GM.deleteValue(this.#key);
    } else {
      await GM.setValue(this.#key, JSON.stringify(this.#value));
    }
  }

  async flush() {
    this.#loadingCount += 1;
    this.#currentAction = (async () => {
      try {
        await this.#flush();
      } finally {
        this.#loadingCount -= 1;
      }
    })();
    await this.#currentAction;
  }

  get() {
    return this.#value ?? this.#defaultValue();
  }

  set(v: T) {
    this.#value = v;
    this.flush();
  }

  dispose() {
    this.#polling.dispose();
  }
}
