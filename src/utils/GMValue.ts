import Polling from './Polling';

export default class GMValue<T> {
  private value: T | undefined;
  private rawValue: string | undefined;

  private loadingCount = 0;

  private currentAction: Promise<void> | undefined;

  private readonly polling: Polling;

  constructor(
    private readonly key: string,
    private readonly defaultValue: () => T
  ) {
    this.polling = new Polling({
      update: () => this.refresh(),
      scheduleNext: (next) => {
        const handle = setTimeout(next, 500);
        return {
          dispose: () => clearTimeout(handle),
        };
      },
    });
  }

  get isLoading() {
    return this.loadingCount > 0;
  }

  private readonly listeners = new Set<(value: T | undefined) => void>();

  public readonly addChangeListener = (
    listener: (value: T | undefined) => void
  ) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  public readonly subscribe = (
    run: (value: T | undefined) => void
  ): (() => void) => {
    run(this.value);
    return this.addChangeListener(run);
  };

  public readonly refresh = async () => {
    if (this.isLoading) {
      await this.currentAction;
      return;
    }

    this.loadingCount += 1;
    this.currentAction = (async () => {
      try {
        const rawValue = await GM.getValue(this.key);
        if (typeof rawValue !== 'string' && rawValue != null) {
          throw new Error(
            `GMValue(${this.key}): unrecognizable value '${rawValue}'`
          );
        }
        if (rawValue === this.rawValue) {
          return;
        }
        this.rawValue = rawValue;
        if (rawValue == null) {
          this.value = undefined;
        } else {
          this.value = JSON.parse(rawValue);
        }
        this.listeners.forEach((i) => i(this.value));
      } finally {
        this.loadingCount -= 1;
      }
    })();
    await this.currentAction;
  };

  public readonly flush = async () => {
    this.loadingCount += 1;
    this.currentAction = (async () => {
      try {
        if (this.value == null) {
          this.rawValue = undefined;
          await GM.deleteValue(this.key);
        } else {
          this.rawValue = JSON.stringify(this.value);
          await GM.setValue(this.key, this.rawValue);
        }
        this.listeners.forEach((i) => i(this.value));
      } finally {
        this.loadingCount -= 1;
      }
    })();
    await this.currentAction;
  };

  public readonly get = () => {
    return this.value ?? this.defaultValue();
  };

  public readonly set = (v: T) => {
    this.value = v;
    this.flush();
  };

  public readonly dispose = () => {
    this.polling.stop();
  };
}
