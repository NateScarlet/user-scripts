import Polling from "./Polling";

export default class GMValue<T> {
  private value: T | undefined;

  private loadingCount = 0;

  private currentAction: Promise<void> | undefined;

  private readonly polling: Polling;

  constructor(
    private readonly key: string,
    private readonly defaultValue: () => T
  ) {
    this.polling = new Polling({
      update: () => this.refresh(),
      scheduleNext: (update) => setTimeout(update, 500),
    });
  }

  get isLoading() {
    return this.loadingCount > 0;
  }

  public async refresh() {
    if (this.isLoading) {
      await this.currentAction;
      return;
    }

    this.loadingCount += 1;
    this.currentAction = (async () => {
      try {
        const value = await GM.getValue(this.key);
        if (value != null) {
          try {
            this.value = JSON.parse(String(value));
          } catch {
            this.value = undefined;
          }
        }
      } finally {
        this.loadingCount -= 1;
      }
    })();
    await this.currentAction;
  }

  public async flush() {
    this.loadingCount += 1;
    this.currentAction = (async () => {
      try {
        if (this.value == null) {
          await GM.deleteValue(this.key);
        } else {
          await GM.setValue(this.key, JSON.stringify(this.value));
        }
      } finally {
        this.loadingCount -= 1;
      }
    })();
    await this.currentAction;
  }

  public get() {
    return this.value ?? this.defaultValue();
  }

  public set(v: T) {
    this.value = v;
    this.flush();
  }

  public dispose() {
    this.polling.dispose();
  }
}
