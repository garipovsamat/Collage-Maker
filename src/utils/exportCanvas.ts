import { CollageElement } from '../types';

export const exportToPNG = (
  elements: CollageElement[],
  canvasRef: React.RefObject<HTMLCanvasElement | null>
) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = 1200;
  const height = 800;
  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  sorted.forEach((el) => {
    ctx.save();

    if (el.type === 'image' && el.src) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = el.src;
      ctx.translate(el.x + el.width / 2, el.y + el.height / 2);
      ctx.rotate((el.rotation * Math.PI) / 180);
      ctx.drawImage(img, -el.width / 2, -el.height / 2, el.width, el.height);
    } else if (el.type === 'text') {
      ctx.translate(el.x, el.y);
      ctx.rotate((el.rotation * Math.PI) / 180);
      ctx.font = '36px Arial';
      ctx.fillStyle = '#000000';
      ctx.textBaseline = 'top';
      ctx.fillText(el.content, 0, 0);
    }

    ctx.restore();
  });

  const link = document.createElement('a');
  link.download = 'collage.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
};