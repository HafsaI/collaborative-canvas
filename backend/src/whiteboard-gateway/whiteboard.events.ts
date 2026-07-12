import { ElementData, ElementType, WhiteboardElement } from '../elements/element.types';

export interface RoomUser {
  socketId: string;
  userId: string;
  name: string;
  color: string;
}

export interface JoinRoomPayload {
  roomId: string;
  user: { userId: string; name: string; color: string };
}

export interface ElementStartPayload {
  roomId: string;
  id: string;
  type: ElementType;
  color: string;
  strokeWidth: number;
  data: ElementData;
}

export interface ElementUpdatePayload {
  roomId: string;
  id: string;
  data: ElementData;
}

export interface ElementEndPayload {
  roomId: string;
  id: string;
  type: ElementType;
  color: string;
  strokeWidth: number;
  data: ElementData;
}

export interface RoomActionPayload {
  roomId: string;
}

// Server -> client events
export interface ServerToClientEvents {
  'room:init': (payload: { elements: WhiteboardElement[]; users: RoomUser[] }) => void;
  'room:users': (users: RoomUser[]) => void;
  'element:start': (payload: ElementStartPayload & { socketId: string }) => void;
  'element:update': (payload: ElementUpdatePayload) => void;
  'element:end': (payload: WhiteboardElement) => void;
  'board:undo': (payload: { id: string }) => void;
  'board:clear': () => void;
  'error:message': (message: string) => void;
}
