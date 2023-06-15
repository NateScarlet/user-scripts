import obtainHTMLElement from "./obtainHTMLElementByID";

export default function injectStyle(id: string, css: string) {
  obtainHTMLElement("style", id, {
    onCreate: (el) => {
      document.head.appendChild(el);
      el.innerHTML = css;
    },
  });
}
