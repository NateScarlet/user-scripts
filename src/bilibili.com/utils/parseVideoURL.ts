export default function parseVideoURL(rawURL: string | undefined) {
  if (!rawURL) {
    return;
  }
  const url = new URL(rawURL, window.location.href);
  if (url.host !== "www.bilibili.com") {
    return;
  }
  const match = /^\/video\//.exec(url.pathname);
  if (!match) {
    return;
  }
  return {};
}
