export default function onDocumentReadyOnce(cb: () => void) {
  if (document.readyState == 'complete') {
    cb();
  } else {
    window.addEventListener('load', cb, { once: true });
  }
}
