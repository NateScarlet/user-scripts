export default class Polling {
  #update: () => Promise<void> | void;

  #scheduleNext: (update: () => void) => void;

  #didRequestedStop = false;

  #workerCount = 0;

  constructor({
    update,
    scheduleNext = requestAnimationFrame,
  }: {
    update: () => Promise<void> | void;
    scheduleNext?: (update: () => void) => void;
  }) {
    this.#update = update;
    this.#scheduleNext = scheduleNext;
    this.start();
  }

  async #run() {
    this.#workerCount += 1;
    try {
      while (!this.#didRequestedStop) {
        // eslint-disable-next-line no-await-in-loop
        await this.#update();
        // eslint-disable-next-line no-await-in-loop
        await new Promise<void>((resolve) => {
          this.#scheduleNext(resolve);
        });
      }
    } finally {
      this.#workerCount -= 1;
    }
  }

  get isRunning() {
    return this.#workerCount > 0;
  }

  start() {
    this.#didRequestedStop = false;
    if (this.isRunning) {
      return;
    }
    this.#run();
  }

  stop() {
    this.#didRequestedStop = true;
  }

  dispose() {
    this.stop();
  }
}