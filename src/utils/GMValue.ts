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

  public readonly refresh = async () => {
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
