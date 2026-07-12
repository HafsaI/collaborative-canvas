import { Inject, Injectable } from '@nestjs/common';
import { Kysely, Selectable } from 'kysely';
import { KYSELY } from '../database/database.module';
import { Database, ElementsTable } from '../database/database.types';
import { ElementData, ElementType, WhiteboardElement } from './element.types';

interface CreateElementInput {
  id: string;
  roomId: string;
  type: ElementType;
  color: string;
  strokeWidth: number;
  data: ElementData;
  createdBy: string;
}

@Injectable()
export class ElementsService {
  constructor(@Inject(KYSELY) private readonly db: Kysely<Database>) {}

  async listByRoom(roomId: string): Promise<WhiteboardElement[]> {
    const rows = await this.db
      .selectFrom('elements')
      .selectAll()
      .where('room_id', '=', roomId)
      .orderBy('created_at', 'asc')
      .execute();

    return rows.map(this.toDto);
  }

  async create(input: CreateElementInput): Promise<WhiteboardElement> {
    const row = await this.db
      .insertInto('elements')
      .values({
        id: input.id,
        room_id: input.roomId,
        type: input.type,
        color: input.color,
        stroke_width: input.strokeWidth,
        data: JSON.stringify(input.data),
        created_by: input.createdBy,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.toDto(row);
  }

  async deleteLastInRoom(roomId: string): Promise<WhiteboardElement | null> {
    const last = await this.db
      .selectFrom('elements')
      .selectAll()
      .where('room_id', '=', roomId)
      .orderBy('created_at', 'desc')
      .limit(1)
      .executeTakeFirst();

    if (!last) return null;

    await this.db.deleteFrom('elements').where('id', '=', last.id).execute();

    return this.toDto(last);
  }

  async clearRoom(roomId: string): Promise<void> {
    await this.db.deleteFrom('elements').where('room_id', '=', roomId).execute();
  }

  private toDto(row: Selectable<ElementsTable>): WhiteboardElement {
    return {
      id: row.id,
      roomId: row.room_id,
      type: row.type,
      color: row.color,
      strokeWidth: row.stroke_width,
      data: row.data as unknown as ElementData,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at).toISOString(),
    };
  }
}
