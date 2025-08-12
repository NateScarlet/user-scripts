let cache:
  | {
      value: ReturnType<typeof compute>;
      notAfter: number;
    }
  | undefined;

function compute(): 'dark' | 'light' {
  const el = document.getElementById('__css-map__');
  if (el instanceof HTMLLinkElement && el.href.endsWith('/dark.css')) {
    return 'dark';
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
