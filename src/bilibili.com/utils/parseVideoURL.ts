export default function parseVideoURL(rawURL: string | null | undefined) {
  if (!rawURL) {
    return;
  }
  const url = new URL(rawURL, window.location.href);
  if (url.host !== 'www.bilibili.com') {
    return;
  }
  const match = /^\/video\/(BV[0-9a-zA-Z]+)\/?/.exec(url.pathname);
  if (!match) {
    return;
  }
  return {
    id: match[1],
  };
}
