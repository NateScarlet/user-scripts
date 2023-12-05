import isCanvasTainted from './isCanvasTainted';

export default async function imageToCanvas(
  img: HTMLImageElement,
  {
    background,
  }: {
    background?: string | CanvasGradient | CanvasPattern;
  } = {}
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);
  if (img.src && img.crossOrigin !== 'anonymous' && isCanvasTainted(canvas)) {
    const corsImage = new Image();
    corsImage.crossOrigin = 'anonymous';
    corsImage.src = img.src;
    await corsImage.decode();
    return imageToCanvas(corsImage, { background });
  }
  return canvas;
}
