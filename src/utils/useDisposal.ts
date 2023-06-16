export interface Disposable {
  dispose(): void;
}

export type Disposal = Disposable & {
  push: (i: Disposable) => void;
};

export default function useDisposal(): Disposal {
  const filoQueue: Disposable[] = [];

  function push(d: Disposable) {
    filoQueue.push(d);
  }
  function dispose() {
    while (filoQueue.length > 0) {
      const next = filoQueue.pop();
      if (next) {
        next.dispose();
      }
    }
  }
  return {
    push,
    dispose,
  };
}
