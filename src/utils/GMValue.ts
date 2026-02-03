import 'core-js/actual/symbol';

import Polling from './Polling';

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
      scheduleNext: (next) => {
        const stack = new DisposableStack();
        stack.adopt(setTimeout(next, 500), clearTimeout);
        return stack;
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
        const value = await GM.getValue(this.key);
        let newValue: T | undefined;
        if (value == null) {
          newValue = undefined;
        } else if (typeof value === 'string') {
          newValue = JSON.parse(value);
        } else {
          throw new Error(
            `GMValue(${this.key}): unrecognizable value '${value}'`
          );
        }

        if (JSON.stringify(this.value) !== JSON.stringify(newValue)) {
          this.value = newValue;
          this.listeners.forEach((i) => i(this.value));
        }
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
          await GM.deleteValue(this.key);
        } else {
          await GM.setValue(this.key, JSON.stringify(this.value));
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

  public readonly [Symbol.dispose] = () => {
    this.polling.stop();
  };
}
