import obtainHTMLElement from "./obtainHTMLElementByID";

export default function injectStyle(id: string, css: string) {
  obtainHTMLElement({
    tag: "style",
    id,
    onDidCreate: (el) => {
      document.head.appendChild(el);
      el.innerHTML = css;
    },
  });
}
