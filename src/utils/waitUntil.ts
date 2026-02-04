export default async function waitUntil({
  ready,
  timeoutMs = 60e3,
  debounceMs = 500,
  onTimeout = () => {
    throw new Error('wait timeout');
  },
  scheduleNext = (next) => setTimeout(next, 100),
}: {
  ready: () => boolean | Promise<boolean>;
  timeoutMs?: number;
  onTimeout?: () => void | Promise<void>;
  scheduleNext?: (next: () => void) => void;
  debounceMs?: number;
}): Promise<void> {
  const startAt = performance.now();

  let readyAt = 0;
  do {
    if (await ready()) {
      if (!readyAt) {
        readyAt = performance.now();
      }
    } else {
      readyAt = 0;
    }
    await new Promise<void>((resolve) => {
      scheduleNext(resolve);
    });
    if (performance.now() - startAt > timeoutMs) {
      return onTimeout();
    }
  } while (readyAt === 0 || performance.now() - readyAt <= debounceMs);
}
