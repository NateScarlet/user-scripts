export default function growTextAreaHeight(el: HTMLTextAreaElement) {
  if (el.scrollHeight > el.clientHeight) {
    el.style.height = `${el.scrollHeight}px`;
  }
}
