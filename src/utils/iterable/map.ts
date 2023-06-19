export default function* map<TIn, TOut>(
  v: Iterable<TIn>,
  cb: (i: TIn) => TOut
): IterableIterator<TOut> {
  for (const i of v) {
    yield cb(i);
  }
}
