export type ElementType = 'pen' | 'rectangle' | 'circle';

export interface Point {
  x: number;
  y: number;
}

/** Freehand pen: array of points. Rectangle/circle: bounding box (x, y, width, height). */
export type ElementData = { points: Point[] } | { x: number; y: number; width: number; height: number };

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
