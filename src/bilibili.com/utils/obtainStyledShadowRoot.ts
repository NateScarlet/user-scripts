import obtainHTMLElementByDataKey from '@/utils/obtainHTMLElementByDataKey';
import css from '../style.css';

const key = '36fff111-0148-4cc1-869b-06dfdfc36861';

const map = new WeakMap<HTMLElement, ShadowRoot>();
export default function obtainStyledShadowRoot(el: HTMLElement) {
  const root =
    map.get(el) ?? el.shadowRoot ?? el.attachShadow({ mode: 'closed' });
  map.set(el, root);
  obtainHTMLElementByDataKey({
    tag: 'style',
    key,
    parentNode: root,
    onDidCreate: (el) => {
      el.innerHTML = css;
      root.prepend(el);
    },
  });
  return root;
}
