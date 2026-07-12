import { useCallback, useEffect, useRef } from 'react';
import { getSocket } from '../lib/socket';
import { useWhiteboardStore } from '../store/useWhiteboardStore';
import { ElementData } from '../types/whiteboard';
import { drawElement } from '../utils/draw';

interface CanvasProps {
  roomId: string;
  userId: string;
}

export default function Canvas({ roomId, userId }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const drawingIdRef = useRef<string | null>(null);
  const pendingEmitRef = useRef<ElementData | null>(null);
  const rafRef = useRef<number | null>(null);

  const elements = useWhiteboardStore((s) => s.elements);
  const liveElements = useWhiteboardStore((s) => s.liveElements);
  const tool = useWhiteboardStore((s) => s.tool);
  const color = useWhiteboardStore((s) => s.color);
  const strokeWidth = useWhiteboardStore((s) => s.strokeWidth);

  // Resize canvas to fill its container, accounting for device pixel ratio.
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      render();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(wrap);
    resize();

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    for (const el of useWhiteboardStore.getState().elements) {
      drawElement(ctx, el.type, el.color, el.strokeWidth, el.data);
    }
    for (const live of Object.values(useWhiteboardStore.getState().liveElements)) {
      drawElement(ctx, live.type, live.color, live.strokeWidth, live.data);
    }
  }, []);

  useEffect(() => {
    render();
  }, [elements, liveElements, render]);

  function getPoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function scheduleUpdateEmit(id: string) {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (pendingEmitRef.current) {
        getSocket().emit('element:update', { roomId, id, data: pendingEmitRef.current });
      }
    });
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const point = getPoint(e);
    const id = crypto.randomUUID();
    drawingIdRef.current = id;
    canvasRef.current?.setPointerCapture(e.pointerId);

    const data: ElementData = tool === 'pen' ? { points: [point] } : { x: point.x, y: point.y, width: 0, height: 0 };

    useWhiteboardStore.getState().startLiveElement({ id, type: tool, color, strokeWidth, data, isLocal: true });
    getSocket().emit('element:start', { roomId, id, type: tool, color, strokeWidth, data });
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const id = drawingIdRef.current;
    if (!id) return;
    const point = getPoint(e);
    const current = useWhiteboardStore.getState().liveElements[id];
    if (!current) return;

    let data: ElementData;
    if (current.type === 'pen' && 'points' in current.data) {
      data = { points: [...current.data.points, point] };
    } else if (!('points' in current.data)) {
      data = { x: current.data.x, y: current.data.y, width: point.x - current.data.x, height: point.y - current.data.y };
    } else {
      return;
    }

    useWhiteboardStore.getState().updateLiveElement(id, data);
    pendingEmitRef.current = data;
    scheduleUpdateEmit(id);
  }

  function handlePointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    const id = drawingIdRef.current;
    if (!id) return;
    drawingIdRef.current = null;
    pendingEmitRef.current = null;
    canvasRef.current?.releasePointerCapture(e.pointerId);

    const current = useWhiteboardStore.getState().liveElements[id];
    if (!current) return;

    getSocket().emit('element:end', {
      roomId,
      id,
      type: current.type,
      color: current.color,
      strokeWidth: current.strokeWidth,
      data: current.data,
    });

    useWhiteboardStore.getState().endLiveElement(id, {
      id,
      roomId,
      type: current.type,
      color: current.color,
      strokeWidth: current.strokeWidth,
      data: current.data,
      createdBy: userId,
      createdAt: new Date().toISOString(),
    });
  }

  return (
    <div
      className="relative min-h-0 flex-1 overflow-hidden bg-surface bg-[radial-gradient(circle,_#e4e5e9_1px,_transparent_1px)] [background-size:22px_22px]"
      ref={wrapRef}
    >
      <canvas
        className="absolute inset-0 block touch-none"
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
    </div>
  );
}
