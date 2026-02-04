export default function obtainHTMLElementByID<
  K extends keyof HTMLElementTagNameMap,
>({
  tag,
  id,
  onDidCreate,
}: {
  tag: K;
  id: string;
  onDidCreate?: (el: HTMLElementTagNameMap[K]) => void;
}): HTMLElementTagNameMap[K] {
  const match = document.getElementById(id);
  if (match) {
    return match as HTMLElementTagNameMap[K];
  }
  const el = document.createElement(tag);
  el.id = id;
  onDidCreate?.(el);
  return el;
}
