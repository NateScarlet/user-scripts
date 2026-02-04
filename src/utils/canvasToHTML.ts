export default function canvasToHTML(
  canvas: HTMLCanvasElement,
  alt = '',
  title = ''
): string {
  return `<img src="${canvas.toDataURL()}" alt="${alt}" title="${title}"/>`;
}
