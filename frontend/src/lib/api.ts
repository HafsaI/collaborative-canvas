import { Room } from '../types/whiteboard';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export async function createRoom(name?: string): Promise<Room> {
  const res = await fetch(`${API_URL}/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Failed to create room');
  return res.json();
}

export async function getRoom(id: string): Promise<Room | null> {
  const res = await fetch(`${API_URL}/rooms/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch room');
  return res.json();
}
