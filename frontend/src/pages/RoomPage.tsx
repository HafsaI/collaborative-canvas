import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button';
import Canvas from '../components/Canvas';
import Field from '../components/Field';
import RoomHeader from '../components/RoomHeader';
import Toolbar from '../components/Toolbar';
import { getSocket } from '../lib/socket';
import { useWhiteboardStore } from '../store/useWhiteboardStore';
import { colorForUserId } from '../utils/color';
import { getOrCreateUserId, getStoredUserName, setStoredUserName } from '../utils/id';

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const userId = useMemo(() => getOrCreateUserId(), []);
  const userColor = useMemo(() => colorForUserId(userId), [userId]);
  const [name, setName] = useState(getStoredUserName());
  const [needsName, setNeedsName] = useState(!getStoredUserName());

  const status = useWhiteboardStore((s) => s.status);
  const errorMessage = useWhiteboardStore((s) => s.errorMessage);
  const setStatus = useWhiteboardStore((s) => s.setStatus);
  const setInitialState = useWhiteboardStore((s) => s.setInitialState);
  const setUsers = useWhiteboardStore((s) => s.setUsers);
  const startLiveElement = useWhiteboardStore((s) => s.startLiveElement);
  const updateLiveElement = useWhiteboardStore((s) => s.updateLiveElement);
  const endLiveElement = useWhiteboardStore((s) => s.endLiveElement);
  const removeElement = useWhiteboardStore((s) => s.removeElement);
  const clearElements = useWhiteboardStore((s) => s.clearElements);
  const reset = useWhiteboardStore((s) => s.reset);

  useEffect(() => {
    if (!roomId) navigate('/');
  }, [roomId, navigate]);

  useEffect(() => {
    if (!roomId || needsName) return;

    const socket = getSocket();
    setStatus('connecting');

    function join() {
      socket.emit('room:join', { roomId: roomId!, user: { userId, name, color: userColor } });
    }

    socket.on('connect', join);
    socket.on('connect_error', () => setStatus('error', 'Could not connect to the server.'));
    socket.on('room:init', ({ elements, users }) => {
      setInitialState(elements, users);
      setStatus('connected');
    });
    socket.on('room:users', setUsers);
    socket.on('element:start', (payload) => {
      startLiveElement({ ...payload, isLocal: false });
    });
    socket.on('element:update', (payload) => {
      updateLiveElement(payload.id, payload.data);
    });
    socket.on('element:end', (payload) => {
      endLiveElement(payload.id, payload);
    });
    socket.on('board:undo', ({ id }) => removeElement(id));
    socket.on('board:clear', () => clearElements());
    socket.on('error:message', (message) => setStatus('error', message));

    socket.connect();
    if (socket.connected) join();

    return () => {
      socket.emit('room:leave', { roomId: roomId! });
      socket.removeAllListeners();
      socket.disconnect();
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, needsName]);

  if (!roomId) {
    return null;
  }

  if (needsName) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45">
        <div className="w-full max-w-[360px] rounded-3xl bg-surface p-8 shadow-lg">
          <h2 className="mb-1.5 text-xl font-bold">Join this whiteboard</h2>
          <p className="mb-5 text-sm text-text-muted">Pick a name so others can see who's drawing.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const trimmed = name.trim();
              if (!trimmed) return;
              setStoredUserName(trimmed);
              setNeedsName(false);
            }}
          >
            <Field
              id="join-name"
              label="Your name"
              autoFocus
              placeholder="Your name"
              value={name}
              maxLength={30}
              onChange={(e) => setName(e.target.value)}
            />
            <Button type="submit">Join room</Button>
          </form>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-text-muted">
        <p>{errorMessage ?? 'Something went wrong.'}</p>
        <Button variant="secondary" className="w-auto px-5 py-2.5" onClick={() => navigate('/')}>
          Back home
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <RoomHeader />
      <div className="relative flex min-h-0 flex-1">
        <Canvas roomId={roomId} userId={userId} />
        <Toolbar roomId={roomId} />
      </div>
    </div>
  );
}
