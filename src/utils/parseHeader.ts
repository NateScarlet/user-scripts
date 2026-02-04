export default function parseHeader(headers: string): Map<string, string[]> {
  const ret = new Map<string, string[]>();
  for (const line of headers.split('\r\n')) {
    if (!line) {
      continue;
    }
    const match = /^(.+?): ?(.+)$/.exec(line);
    if (!match) {
      throw new Error(`malformed header: ${line}`);
    }
    const [, key, value] = match;
    if (!ret.has(key)) {
      ret.set(key, []);
    }
    ret.get(key)!.push(value);
  }
  return ret;
}
