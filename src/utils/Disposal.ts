export interface Disposable {
  readonly dispose: () => void;
}

export default class Disposal implements Disposable {
  private readonly filo: Disposable[] = [];

  public readonly push = (d: Disposable) => {
    this.filo.push(d);
  };

  public readonly dispose = () => {
    while (this.filo.length > 0) {
      const next = this.filo.pop();
      if (next) {
        next.dispose();
      }
    }
  };
}
