import { io, Socket } from 'socket.io-client';
import { ElementData, ElementType, RoomUser, WhiteboardElement } from '../types/whiteboard';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3001';

export interface ClientToServerEvents {
  'room:join': (payload: { roomId: string; user: { userId: string; name: string; color: string } }) => void;
  'room:leave': (payload: { roomId: string }) => void;
  'element:start': (payload: {
    roomId: string;
    id: string;
    type: ElementType;
    color: string;
    strokeWidth: number;
    data: ElementData;
  }) => void;
  'element:update': (payload: { roomId: string; id: string; data: ElementData }) => void;
  'element:end': (payload: {
    roomId: string;
    id: string;
    type: ElementType;
    color: string;
    strokeWidth: number;
    data: ElementData;
  }) => void;
  'board:undo': (payload: { roomId: string }) => void;
  'board:clear': (payload: { roomId: string }) => void;
}

export interface ServerToClientEvents {
  'room:init': (payload: { elements: WhiteboardElement[]; users: RoomUser[] }) => void;
  'room:users': (users: RoomUser[]) => void;
  'element:start': (payload: {
    roomId: string;
    id: string;
    type: ElementType;
    color: string;
    strokeWidth: number;
    data: ElementData;
    socketId: string;
  }) => void;
  'element:update': (payload: { roomId: string; id: string; data: ElementData }) => void;
  'element:end': (payload: WhiteboardElement) => void;
  'board:undo': (payload: { id: string }) => void;
  'board:clear': () => void;
  'error:message': (message: string) => void;
}

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (!socket) {
    socket = io(SOCKET_URL, { autoConnect: false, transports: ['websocket', 'polling'] });
  }
  return socket;
}
