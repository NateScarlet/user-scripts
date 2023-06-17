export default function canvasToMarkdown(
  canvas: HTMLCanvasElement,
  alt = "",
  title = ""
): string {
  return `![${alt}](${canvas.toDataURL()} "${title}")`;
}
