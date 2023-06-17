export default function obtainHTMLElementByID<
  K extends keyof HTMLElementTagNameMap
>({
  tag,
  id,
  onDidCreate,
}: {
  tag: K;
  id: string;
  onDidCreate?: (el: HTMLElementTagNameMap[K]) => void;
}): HTMLElementTagNameMap[K] {
  const match = document.getElementById(id) as HTMLElementTagNameMap[K];
  if (match) {
    return match;
  }
  const el = document.createElement(tag);
  el.id = id;
  onDidCreate?.(el);
  return el;
}
