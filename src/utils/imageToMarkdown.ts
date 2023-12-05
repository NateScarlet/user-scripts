import canvasToMarkdown from './canvasToMarkdown';
import imageToCanvas from './imageToCanvas';

export default async function imageToMarkdown(
  img: HTMLImageElement,
  {
    background,
  }: {
    background?: string | CanvasGradient | CanvasPattern;
  } = {}
): Promise<string> {
  return canvasToMarkdown(
    await imageToCanvas(img, { background }),
    img.alt,
    img.title
  );
}
