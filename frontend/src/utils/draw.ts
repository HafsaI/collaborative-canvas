import { ElementData, ElementType, isPenData } from '../types/whiteboard';

export function normalizeBounds(data: ElementData): { x: number; y: number; width: number; height: number } {
  if (isPenData(data)) {
    const xs = data.points.map((p) => p.x);
    const ys = data.points.map((p) => p.y);
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
  }
  return {
    x: Math.min(data.x, data.x + data.width),
    y: Math.min(data.y, data.y + data.height),
    width: Math.abs(data.width),
    height: Math.abs(data.height),
  };
}

export function drawElement(
  ctx: CanvasRenderingContext2D,
  type: ElementType,
  color: string,
  strokeWidth: number,
  data: ElementData,
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if (type === 'pen' && isPenData(data)) {
    if (data.points.length < 2) {
      if (data.points.length === 1) {
        const p = data.points[0];
        ctx.beginPath();
        ctx.arc(p.x, p.y, strokeWidth / 2, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }
      return;
    }
    ctx.beginPath();
    ctx.moveTo(data.points[0].x, data.points[0].y);
    for (let i = 1; i < data.points.length; i++) {
      ctx.lineTo(data.points[i].x, data.points[i].y);
    }
    ctx.stroke();
    return;
  }

  if (!isPenData(data)) {
    const { x, y, width, height } = normalizeBounds(data);
    if (type === 'rectangle') {
      ctx.strokeRect(x, y, width, height);
    } else if (type === 'circle') {
      ctx.beginPath();
      ctx.ellipse(x + width / 2, y + height / 2, Math.max(width / 2, 0.01), Math.max(height / 2, 0.01), 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}
