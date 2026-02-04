import isAbortError from './isAbortError';

export class PollingContext {
  /** stack 直到下次执行或中止轮询才会被清理 */
  public readonly cleanups: (() => void)[] = [];

  private isDisposed = false;

  private lazySignal?: AbortSignal;

  get signal(): AbortSignal {
    if (this.lazySignal == null) {
      const ctr = new AbortController();
      this.cleanups.push(() => ctr.abort());
      this.lazySignal = ctr.signal;
    }
    return this.lazySignal;
  }

  public readonly stopPolling = () => {
    this.dispose();
  };

  public readonly dispose = () => {
    if (this.isDisposed) {
      return;
    }
    this.isDisposed = true;
    while (this.cleanups.length > 0) {
      const cleanup = this.cleanups.pop();
      try {
        cleanup?.();
      } catch (err) {
        console.error(err);
      }
    }
  };

  public get disposed() {
    return this.isDisposed;
  }
}

interface Disposable {
  dispose(): void;
}

function createOptions({
  update,
  scheduleNext = (next) => {
    const handle = requestAnimationFrame(next);
    return {
      dispose: () => cancelAnimationFrame(handle),
    };
  },
  onError,
}: {
  update: (ctx: PollingContext) => Promise<void> | void;
  scheduleNext?: (next: () => void) => Disposable;
  onError?: (err: unknown) => void;
}) {
  return {
    update,
    scheduleNext,
    onError,
  };
}

export default class Polling {
  private readonly options: ReturnType<typeof createOptions>;
  constructor(...options: Parameters<typeof createOptions>) {
    this.options = createOptions(...options);
    this.start();
  }
  private active?: PollingContext;

  private async run() {
    if (this.active != null) {
      // 已经在进行了
      return;
    }

    try {
      /** eslint-disable no-await-in-loop */
      while (!this.active?.disposed) {
        const ctx = new PollingContext();
        this.active?.dispose();
        this.active = ctx;

        // 执行
        try {
          await this.options.update(ctx);
        } catch (err) {
          if (!isAbortError(err)) {
            this.options.onError?.(err);
          }
        }

        if (ctx.disposed) {
          // 执行中取消了，不再调度下一次
          return;
        }

        // 调度
        try {
          await new Promise<void>((resolve, reject) => {
            if (ctx.disposed) {
              resolve();
              return;
            }

            // 中途中止也视为等待完成
            ctx.cleanups.push(resolve);

            let nextTask: Disposable | undefined;
            try {
              nextTask = this.options.scheduleNext(resolve);
              if (nextTask) {
                const task = nextTask;
                ctx.cleanups.push(() => task.dispose());
              }
            } catch (err) {
              reject(err);
            }
          });
        } catch (err) {
          ctx.dispose(); // 无法继续调度，只能停止
          this.options.onError?.(err);
        }
      }
    } finally {
      this.active?.dispose();
      this.active = undefined;
    }
  }

  get isRunning() {
    return this.active?.disposed === false;
  }

  public readonly start = () => {
    this.run();
  };

  public readonly stop = () => {
    this.active?.dispose();
  };

  public dispose() {
    this.stop();
  }
}
