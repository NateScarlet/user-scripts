import injectStyle from "@/utils/injectStyle";
import css from "./style.css";
const id = "a5b54b00-df07-432b-88ee-b0e6ac1062f2";
const attributeName = `data-${id}`;

export default {
  id,
  css,
  attributeName,
  inject() {
    injectStyle(id, css);
  },
  apply(el: HTMLElement) {
    el.setAttribute(attributeName, "");
  },
};
