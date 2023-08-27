export default function obtainHTMLElementByDataKey<
  K extends keyof HTMLElementTagNameMap
>({
  tag,
  key,
  parentNode = document,
  onDidCreate,
}: {
  tag: K;
  /** dash-style data attribute key, lowercase only */
  key: string;
  parentNode?: ParentNode;
  onDidCreate?: (el: HTMLElementTagNameMap[K]) => void;
}): HTMLElementTagNameMap[K] {
  const match = parentNode.querySelector(
    `[data-${key}]`
  ) as HTMLElementTagNameMap[K];
  if (match) {
    return match;
  }
  const el = document.createElement(tag);
  el.setAttribute(`data-${key}`, '');
  onDidCreate?.(el);
  return el;
}
