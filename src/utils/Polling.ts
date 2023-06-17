export default class Polling {
  private readonly update: () => Promise<void> | void;

  private readonly scheduleNext: (update: () => void) => void;

  private didRequestedStop = false;

  private workerCount = 0;

  constructor({
    update,
    scheduleNext = requestAnimationFrame,
  }: Readonly<{
    update: () => Promise<void> | void;
    scheduleNext?: (update: () => void) => void;
  }>) {
    this.update = update;
    this.scheduleNext = scheduleNext;
    this.start();
  }

  private async run() {
    this.workerCount += 1;
    try {
      while (!this.didRequestedStop) {
        // eslint-disable-next-line no-await-in-loop
        await this.update();
        // eslint-disable-next-line no-await-in-loop
        await new Promise<void>((resolve) => {
          this.scheduleNext(resolve);
        });
      }
    } finally {
      this.workerCount -= 1;
    }
  }

  get isRunning() {
    return this.workerCount > 0;
  }

  public readonly start = () => {
    this.didRequestedStop = false;
    if (this.isRunning) {
      return;
    }
    this.run();
  };

  public readonly stop = () => {
    this.didRequestedStop = true;
  };

  public readonly dispose = () => {
    this.stop();
  };
}
