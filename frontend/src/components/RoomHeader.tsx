import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWhiteboardStore } from '../store/useWhiteboardStore';
import { ShareIcon } from './icons';

const statusDotColor = {
  connected: 'bg-[#2f9e44]',
  connecting: 'bg-[#cccccc]',
  error: 'bg-danger',
  idle: 'bg-[#cccccc]',
};

const statusLabelText = {
  connected: 'Connected',
  connecting: 'Connecting…',
  error: 'Connection error',
  idle: 'Offline',
};

export default function RoomHeader() {
  const navigate = useNavigate();
  const status = useWhiteboardStore((s) => s.status);
  const users = useWhiteboardStore((s) => s.users);
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function handleLeave() {
    navigate('/');
  }

  return (
    <header className="z-10 flex items-center justify-between gap-4 border-b border-border bg-surface px-5 py-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="size-[26px] flex-shrink-0 rounded-[7px] bg-gradient-to-br from-[#6c5ce7] to-[#4fb0ff]" />
        <span className="text-[15px] font-bold whitespace-nowrap">Canvas</span>
        <div className="flex items-center gap-1.5 text-xs whitespace-nowrap text-text-muted">
          <span className={`size-1.5 rounded-full ${statusDotColor[status]}`} />
          {statusLabelText[status]}
        </div>
      </div>

      <div className="flex items-center gap-3.5">
        <div className="flex items-center">
          {users.map((u) => (
            <div
              key={u.socketId}
              className="-ml-2 flex size-[30px] items-center justify-center rounded-full border-2 border-surface text-xs font-bold text-white uppercase first:ml-0"
              style={{ background: u.color }}
              title={u.name}
            >
              {u.name.slice(0, 1)}
            </div>
          ))}
        </div>

        <button
          className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3.5 py-2 text-[13px] font-semibold whitespace-nowrap text-text hover:bg-[#f0f0f2]"
          onClick={handleShare}
        >
          <ShareIcon />
          {copied ? 'Link copied!' : 'Share'}
        </button>

        <button
          className="rounded-lg border border-transparent bg-accent px-3.5 py-2 text-[13px] font-semibold whitespace-nowrap text-white hover:bg-accent-hover"
          onClick={handleLeave}
        >
          Leave
        </button>
      </div>
    </header>
  );
}
