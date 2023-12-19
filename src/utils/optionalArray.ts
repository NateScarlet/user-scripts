export default function optionalArray<T, TArr extends readonly T[]>(
  arr: TArr | null | undefined
): TArr | undefined {
  if (!arr || arr.length === 0) {
    return;
  }
  return arr;
}
