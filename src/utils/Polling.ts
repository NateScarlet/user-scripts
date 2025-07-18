import 'core-js/actual/disposable-stack';
import 'core-js/actual/symbol';
import isAbortError from './isAbortError';

export class PollingContext {
  /** stack 直到下次执行或中止轮询才会被清理 */
  public readonly stack = new DisposableStack();

  private lazySignal?: AbortSignal;

  get signal(): AbortSignal {
    if (this.lazySignal == null) {
      const ctr = this.stack.adopt(new AbortController(), (i) => i.abort());
      this.lazySignal = ctr.signal;
    }
    return this.lazySignal;
  }

  public readonly stopPolling = () => {
    this.stack.dispose();
  };
}

function createOptions({
  update,
  scheduleNext = (next) => {
    const stack = new DisposableStack();
    stack.adopt(requestAnimationFrame(next), cancelAnimationFrame);
    return stack;
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

  private active?: PollingContext;

  constructor(...options: Parameters<typeof createOptions>) {
    this.options = createOptions(...options);
    this.start();
  }

  private async run() {
    if (this.active != null) {
      // 已经在进行了
      return;
    }
    using stack = new DisposableStack();
    stack.defer(() => {
      this.active?.stack.dispose();
      this.active = undefined;
    });
    /** eslint-disable no-await-in-loop */
    while (!this.active?.stack.disposed) {
      const ctx = new PollingContext();
      this.active?.stack.dispose();
      this.active = ctx;
      // 执行
      try {
        await this.options.update(ctx);
      } catch (err) {
        if (!isAbortError(err)) {
          this.options.onError?.(err);
        }
      }
      if (ctx.stack.disposed) {
        // 执行中取消了，不再调度下一次
        return;
      }

      // 调度
      try {
        await new Promise<void>((resolve, reject) => {
          if (ctx.stack.disposed) {
            resolve();
            return;
          }
          ctx.stack.defer(resolve); // 中途中止也视为等待完成
          try {
            ctx.stack.use(this.options.scheduleNext(resolve));
          } catch (err) {
            reject(err);
          }
        });
      } catch (err) {
        ctx.stack.dispose(); // 无法继续调度，只能停止
        this.options.onError?.(err);
      }
    }
  }

  get isRunning() {
    return this.active?.stack.disposed === false;
  }

  public readonly start = () => {
    this.run();
  };

  public readonly stop = () => {
    this.active?.stack.dispose();
  };

  public readonly [Symbol.dispose] = () => {
    this.stop();
  };
}
