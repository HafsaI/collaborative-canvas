import { getSocket } from '../lib/socket';
import { useWhiteboardStore } from '../store/useWhiteboardStore';
import { ElementType } from '../types/whiteboard';
import { STROKE_COLORS } from '../utils/color';
import { CircleIcon, PenIcon, RectangleIcon, TrashIcon, UndoIcon } from './icons';

interface ToolbarProps {
  roomId: string;
}

const TOOLS: { type: ElementType; icon: JSX.Element; label: string }[] = [
  { type: 'pen', icon: <PenIcon />, label: 'Pen' },
  { type: 'rectangle', icon: <RectangleIcon />, label: 'Rectangle' },
  { type: 'circle', icon: <CircleIcon />, label: 'Circle' },
];

const toolBtn =
  'flex size-[38px] items-center justify-center rounded-lg text-text transition hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40';
const toolBtnActive = 'bg-accent-soft text-accent hover:bg-accent-soft';
const toolBtnDanger = 'hover:bg-danger-soft hover:text-danger';

export default function Toolbar({ roomId }: ToolbarProps) {
  const tool = useWhiteboardStore((s) => s.tool);
  const color = useWhiteboardStore((s) => s.color);
  const strokeWidth = useWhiteboardStore((s) => s.strokeWidth);
  const setTool = useWhiteboardStore((s) => s.setTool);
  const setColor = useWhiteboardStore((s) => s.setColor);
  const setStrokeWidth = useWhiteboardStore((s) => s.setStrokeWidth);
  const elementCount = useWhiteboardStore((s) => s.elements.length);

  function handleUndo() {
    getSocket().emit('board:undo', { roomId });
  }

  function handleClear() {
    if (elementCount === 0) return;
    if (!confirm('Clear the entire whiteboard for everyone? This cannot be undone.')) return;
    getSocket().emit('board:clear', { roomId });
  }

  return (
    <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-xl border border-border bg-surface p-2 shadow-md">
      <div className="flex items-center gap-1 px-1.5">
        {TOOLS.map((t) => (
          <button
            key={t.type}
            className={`${toolBtn} ${tool === t.type ? toolBtnActive : ''}`}
            title={t.label}
            aria-label={t.label}
            onClick={() => setTool(t.type)}
          >
            {t.icon}
          </button>
        ))}
      </div>

      <div className="h-7 w-px flex-shrink-0 bg-border" />

      <div className="flex items-center gap-1 px-1.5">
        {STROKE_COLORS.map((c) => (
          <button
            key={c}
            className={`size-[22px] flex-shrink-0 rounded-full border-2 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] transition hover:scale-110 ${
              color === c ? 'scale-[1.12] border-accent' : 'border-transparent'
            }`}
            style={{ background: c }}
            title={c}
            aria-label={`Color ${c}`}
            onClick={() => setColor(c)}
          />
        ))}
        <div className="relative size-[22px] flex-shrink-0" title="Custom color">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            aria-label="Custom color"
            className="absolute inset-0 size-full cursor-pointer rounded-full border-none bg-transparent p-0"
          />
        </div>
      </div>

      <div className="h-7 w-px flex-shrink-0 bg-border" />

      <div className="flex w-[120px] items-center gap-2 px-2" title={`Stroke width: ${strokeWidth}px`}>
        <span className="size-1.5 flex-shrink-0 rounded-full bg-text" />
        <input
          type="range"
          min={1}
          max={24}
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
          aria-label="Stroke width"
          className="flex-1 accent-accent"
        />
        <span className="size-3.5 flex-shrink-0 rounded-full bg-text" />
      </div>

      <div className="h-7 w-px flex-shrink-0 bg-border" />

      <div className="flex items-center gap-1 px-1.5">
        <button
          className={toolBtn}
          title="Undo last action"
          aria-label="Undo"
          onClick={handleUndo}
          disabled={elementCount === 0}
        >
          <UndoIcon />
        </button>
        <button
          className={`${toolBtn} ${toolBtnDanger}`}
          title="Clear whiteboard"
          aria-label="Clear whiteboard"
          onClick={handleClear}
          disabled={elementCount === 0}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}
