export default function growTextAreaHeight(el: HTMLTextAreaElement) {
  const maxHeight = Math.min(window.innerHeight, el.scrollHeight);
  if (el.scrollHeight > el.clientHeight && el.clientHeight < maxHeight) {
    el.style.height = `${maxHeight}px`;
  }
}
