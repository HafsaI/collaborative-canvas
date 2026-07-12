import { create } from 'zustand';
import { ElementData, ElementType, RoomUser, WhiteboardElement } from '../types/whiteboard';
import { STROKE_COLORS } from '../utils/color';

export interface LiveElement {
  id: string;
  type: ElementType;
  color: string;
  strokeWidth: number;
  data: ElementData;
  isLocal: boolean;
}

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';

interface WhiteboardState {
  status: ConnectionStatus;
  errorMessage: string | null;

  elements: WhiteboardElement[];
  liveElements: Record<string, LiveElement>;
  users: RoomUser[];

  tool: ElementType;
  color: string;
  strokeWidth: number;

  setStatus: (status: ConnectionStatus, errorMessage?: string) => void;
  setInitialState: (elements: WhiteboardElement[], users: RoomUser[]) => void;
  setUsers: (users: RoomUser[]) => void;

  startLiveElement: (element: LiveElement) => void;
  updateLiveElement: (id: string, data: ElementData) => void;
  endLiveElement: (id: string, finalElement?: WhiteboardElement) => void;

  removeElement: (id: string) => void;
  clearElements: () => void;

  setTool: (tool: ElementType) => void;
  setColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;

  reset: () => void;
}

const initial = {
  status: 'idle' as ConnectionStatus,
  errorMessage: null as string | null,
  elements: [] as WhiteboardElement[],
  liveElements: {} as Record<string, LiveElement>,
  users: [] as RoomUser[],
  tool: 'pen' as ElementType,
  color: STROKE_COLORS[0],
  strokeWidth: 4,
};

export const useWhiteboardStore = create<WhiteboardState>((set) => ({
  ...initial,

  setStatus: (status, errorMessage) => set({ status, errorMessage: errorMessage ?? null }),

  setInitialState: (elements, users) => set({ elements, users }),

  setUsers: (users) => set({ users }),

  startLiveElement: (element) =>
    set((state) => ({ liveElements: { ...state.liveElements, [element.id]: element } })),

  updateLiveElement: (id, data) =>
    set((state) => {
      const existing = state.liveElements[id];
      if (!existing) return state;
      return { liveElements: { ...state.liveElements, [id]: { ...existing, data } } };
    }),

  endLiveElement: (id, finalElement) =>
    set((state) => {
      const { [id]: _removed, ...rest } = state.liveElements;
      if (!finalElement) return { liveElements: rest };
      const idx = state.elements.findIndex((el) => el.id === finalElement.id);
      const elements =
        idx === -1
          ? [...state.elements, finalElement]
          : state.elements.map((el, i) => (i === idx ? finalElement : el));
      return { liveElements: rest, elements };
    }),

  removeElement: (id) =>
    set((state) => ({ elements: state.elements.filter((el) => el.id !== id) })),

  clearElements: () => set({ elements: [] }),

  setTool: (tool) => set({ tool }),
  setColor: (color) => set({ color }),
  setStrokeWidth: (strokeWidth) => set({ strokeWidth }),

  reset: () => set({ ...initial }),
}));
