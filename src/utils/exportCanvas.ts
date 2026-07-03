import { CollageElement } from '../types';

// Функция для парсинга текста со стилями
const parseTextContent = (content: string) => {
  const match = content.match(/<style>(.*?)<\/style>(.*)/);
  if (match) {
    const styleStr = match[1];
    const text = match[2];
    const styles: {
      bold?: boolean;
      italic?: boolean;
      color?: string;
      size?: number;
    } = {};
    
    if (styleStr.includes('bold')) styles.bold = true;
    if (styleStr.includes('italic')) styles.italic = true;
    const colorMatch = styleStr.match(/color:([^;]+)/);
    if (colorMatch) styles.color = colorMatch[1];
    const sizeMatch = styleStr.match(/size:([^;]+)/);
    if (sizeMatch) styles.size = parseFloat(sizeMatch[1]);
    
    return { text, styles };
  }
  return { text: content, styles: {} };
};

export const exportToPNG = (
  elements: CollageElement[],
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  transparent: boolean = false,
  viewportWidth: number = 1200,
  viewportHeight: number = 800
) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Устанавливаем фиксированный размер (как окно редактирования)
  const width = viewportWidth;
  const height = viewportHeight;
  canvas.width = width;
  canvas.height = height;

  // Если НЕ прозрачный — заливаем белым
  if (!transparent) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }

  // Сортируем по zIndex
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
      // Парсим текст и стили
      const { text, styles } = parseTextContent(el.content);
      
      ctx.translate(el.x, el.y);
      ctx.rotate((el.rotation * Math.PI) / 180);
      
      // Размер шрифта — из стилей или вычисленный
      let fontSize = styles.size || Math.max(14, el.width / 8);
      ctx.font = `${styles.italic ? 'italic ' : ''}${styles.bold ? 'bold ' : ''}${fontSize}px Arial`;
      ctx.fillStyle = styles.color || '#000000';
      ctx.textBaseline = 'top';
      ctx.fillText(text, 0, 0);
    }

    ctx.restore();
  });

  const link = document.createElement('a');
  link.download = 'collage.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
};