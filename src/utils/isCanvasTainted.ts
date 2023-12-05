export default function isCanvasTainted(canvas: HTMLCanvasElement) {
  try {
    canvas.getContext('2d')!.getImageData(0, 0, 1, 1);
    return false;
  } catch (err) {
    return err instanceof DOMException && err.name === 'SecurityError';
  }
}
