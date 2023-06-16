import randomUUID from "./randomUUID";

const attributeName = `data-select-${randomUUID()}`;
let nextValue = 1;

export default function getElementSelector<T extends Element>(el: T): string {
  let v = el.getAttribute(attributeName);
  if (!v) {
    v = nextValue.toString();
    nextValue += 1;
    el.setAttribute(attributeName, v);
  }
  return `[${attributeName}='${v}']`;
}
