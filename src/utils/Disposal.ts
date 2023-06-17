export interface Disposable {
  dispose(): void;
}

export default class Disposal implements Disposable {
  #filo: Disposable[] = [];

  push(d: Disposable) {
    this.#filo.push(d);
  }

  dispose() {
    while (this.#filo.length > 0) {
      const next = this.#filo.pop();
      if (next) {
        next.dispose();
      }
    }
  }
}
