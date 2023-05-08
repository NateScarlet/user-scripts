import usePolling from "./usePolling";

export default function useGMValue<T>(
  key: string,
  defaultValue: T
): {
  value: T;
  readonly isLoading: boolean;
  dispose(): void;
} {
  const state = {
    value: defaultValue,
    loadingCount: 0,
  };
  async function read() {
    if (state.loadingCount > 0) {
      return;
    }
    state.loadingCount += 1;
    try {
      const value = await GM.getValue(key);
      if (value != null) {
        try {
          state.value = JSON.parse(String(value));
        } catch {
          state.value = defaultValue;
        }
      }
    } finally {
      state.loadingCount -= 1;
    }
  }
  async function write() {
    state.loadingCount += 1;
    try {
      if (state.value == null) {
        await GM.deleteValue(key);
      } else {
        await GM.setValue(key, JSON.stringify(state.value));
      }
    } finally {
      state.loadingCount -= 1;
    }
  }
  read();
  const polling = usePolling({
    update: () => read(),
    scheduleNext: (update) => setTimeout(update, 500),
  });

  return {
    get value() {
      return state.value;
    },
    set value(v: T) {
      state.value = v;
      write();
    },
    get isLoading() {
      return state.loadingCount > 0;
    },
    dispose: polling.dispose,
  };
}