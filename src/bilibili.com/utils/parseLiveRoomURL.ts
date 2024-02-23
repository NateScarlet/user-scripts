export default function parseLiveRoomURL(
  rawURL: string | null | undefined
): { id: string } | undefined {
  if (!rawURL) {
    return;
  }
  const url = new URL(rawURL, window.location.href);
  switch (url.host) {
    case 'live.bilibili.com': {
      const match = /^\/(\d+)\/?/.exec(url.pathname);
      if (!match) {
        return;
      }
      return { id: match[1] };
    }
    default:
  }
}
