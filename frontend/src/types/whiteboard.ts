export type ElementType = 'pen' | 'rectangle' | 'circle';

export interface Point {
  x: number;
  y: number;
}

export type PenData = { points: Point[] };
export type ShapeData = { x: number; y: number; width: number; height: number };
export type ElementData = PenData | ShapeData;

export interface WhiteboardElement {
  id: string;
  roomId: string;
  type: ElementType;
  color: string;
  strokeWidth: number;
  data: ElementData;
  createdBy: string;
  createdAt: string;
}

export interface RoomUser {
  socketId: string;
  userId: string;
  name: string;
  color: string;
}

export interface Room {
  id: string;
  name: string | null;
  createdAt: string;
}

export function isPenData(data: ElementData): data is PenData {
  return 'points' in data;
}
