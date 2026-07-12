import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Field from '../components/Field';
import { createRoom, getRoom } from '../lib/api';
import { extractRoomId, getStoredUserName, setStoredUserName } from '../utils/id';

export default function HomePage() {
  const navigate = useNavigate();
  const [name, setName] = useState(getStoredUserName());
  const [joinValue, setJoinValue] = useState('');
  const [loading, setLoading] = useState<'create' | 'join' | null>(null);
  const [error, setError] = useState<string | null>(null);

  function persistName() {
    const trimmed = name.trim();
    if (trimmed) setStoredUserName(trimmed);
  }

  async function handleCreate() {
    setError(null);
    setLoading('create');
    persistName();
    try {
      const room = await createRoom();
      navigate(`/room/${room.id}`);
    } catch {
      setError('Could not create a room. Is the server running?');
    } finally {
      setLoading(null);
    }
  }

  async function handleJoin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const roomId = extractRoomId(joinValue);
    if (!roomId) {
      setError('Enter a valid room link or room ID.');
      return;
    }
    setLoading('join');
    persistName();
    try {
      const room = await getRoom(roomId);
      if (!room) {
        setError('That room could not be found.');
        return;
      }
      navigate(`/room/${room.id}`);
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-[radial-gradient(circle_at_15%_20%,rgba(108,92,231,0.12),transparent_45%),radial-gradient(circle_at_85%_80%,rgba(79,176,255,0.12),transparent_45%)] bg-bg p-6">
      <div className="w-full max-w-[420px] rounded-3xl border border-border bg-surface px-9 py-10 shadow-lg">
        <div className="mb-2 flex items-center gap-2.5">
          <div className="size-8 flex-shrink-0 rounded-[9px] bg-gradient-to-br from-[#6c5ce7] to-[#4fb0ff]" />
          <span className="text-lg font-bold tracking-tight">Canvas</span>
        </div>
        <h1 className="mt-5 mb-1.5 text-2xl font-bold tracking-tight">Draw together, live</h1>
        <p className="mb-7 text-sm leading-relaxed text-text-muted">
          Start a whiteboard room and share the link, or join one a teammate already started.
        </p>

        <Field
          id="name"
          label="Your name"
          placeholder="e.g. Hafsa"
          value={name}
          maxLength={30}
          onChange={(e) => setName(e.target.value)}
        />

        <Button onClick={handleCreate} disabled={loading !== null}>
          {loading === 'create' ? 'Creating room…' : 'Create a new room'}
        </Button>

        <div className="my-[26px] flex items-center gap-3 text-xs tracking-wide text-text-muted uppercase">
          <div className="h-px flex-1 bg-border" />
          or
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleJoin}>
          <Field
            id="join"
            label="Room link or ID"
            placeholder="Paste a shareable room URL"
            value={joinValue}
            onChange={(e) => setJoinValue(e.target.value)}
          />
          <Button variant="secondary" type="submit" disabled={loading !== null}>
            {loading === 'join' ? 'Joining…' : 'Join room'}
          </Button>
        </form>

        {error && (
          <div className="mt-3.5 rounded-lg bg-danger-soft px-3 py-2.5 text-[13px] text-danger">{error}</div>
        )}
      </div>
    </div>
  );
}
