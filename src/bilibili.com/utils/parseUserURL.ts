export default function parseUserURL(
  rawURL: string | null | undefined
): { id: string } | undefined {
  if (!rawURL) {
    return;
  }
  const url = new URL(rawURL, window.location.href);
  switch (url.host) {
    case 'space.bilibili.com': {
      const match = /^\/(\d+)\/?/.exec(url.pathname);
      if (!match) {
        return;
      }
      return { id: match[1] };
    }
    case 'cm.bilibili.com': {
      const id = url.searchParams.get('space_mid');
      if (id) {
        return { id };
      }
      break;
    }
    default:
  }
}
