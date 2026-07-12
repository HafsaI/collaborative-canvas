import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Kysely } from 'kysely';
import { KYSELY } from '../database/database.module';
import { Database } from '../database/database.types';
import { Room } from './room.types';

@Injectable()
export class RoomsService {
  constructor(@Inject(KYSELY) private readonly db: Kysely<Database>) {}

  async create(name?: string): Promise<Room> {
    const row = await this.db
      .insertInto('rooms')
      .values({ name: name ?? null })
      .returningAll()
      .executeTakeFirstOrThrow();

    return { id: row.id, name: row.name, createdAt: new Date(row.created_at).toISOString() };
  }

  async findById(id: string): Promise<Room> {
    const row = await this.db.selectFrom('rooms').selectAll().where('id', '=', id).executeTakeFirst();

    if (!row) throw new NotFoundException(`Room ${id} not found`);

    return { id: row.id, name: row.name, createdAt: new Date(row.created_at).toISOString() };
  }

  async exists(id: string): Promise<boolean> {
    const row = await this.db
      .selectFrom('rooms')
      .select('id')
      .where('id', '=', id)
      .executeTakeFirst();

    return !!row;
  }
}
