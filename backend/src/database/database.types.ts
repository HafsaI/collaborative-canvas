import { ColumnType, Generated } from 'kysely';

export type ElementType = 'pen' | 'rectangle' | 'circle';

export interface RoomsTable {
  id: Generated<string>;
  name: string | null;
  created_at: ColumnType<Date, string | undefined, never>;
}

export interface ElementsTable {
  id: Generated<string>;
  room_id: string;
  type: ElementType;
  color: string;
  stroke_width: number;
  data: ColumnType<Record<string, unknown>, string, string>;
  created_by: string;
  created_at: ColumnType<Date, string | undefined, never>;
}

export interface Database {
  rooms: RoomsTable;
  elements: ElementsTable;
}
