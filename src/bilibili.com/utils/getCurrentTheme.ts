let cache:
  | {
      value: ReturnType<typeof compute>;
      notAfter: number;
    }
  | undefined;

function compute(): 'dark' | 'light' {
  const match = getComputedStyle(document.body).backgroundColor.match(
    /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*[\d.]+)?\s*\)$/
  );
  if (match) {
    const luminance =
      (0.299 * Number.parseInt(match[1], 10) +
        0.587 * Number.parseInt(match[2], 10) +
        0.114 * Number.parseInt(match[3], 10)) /
      255;
    return luminance > 0.5 ? 'light' : 'dark';
  }
  return 'light';
}

export default function getCurrentTheme(): 'dark' | 'light' {
  const now = performance?.now() ?? Date.now();
  if (!cache || now >= cache.notAfter) {
    cache = { value: compute(), notAfter: now + 1e3 };
  }
  return cache.value;
}
