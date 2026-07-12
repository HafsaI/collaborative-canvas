import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`create extension if not exists "pgcrypto"`.execute(db);

  await db.schema
    .createTable('rooms')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('name', 'text')
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await db.schema
    .createTable('elements')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('room_id', 'uuid', (col) =>
      col.notNull().references('rooms.id').onDelete('cascade'),
    )
    .addColumn('type', 'text', (col) => col.notNull())
    .addColumn('color', 'text', (col) => col.notNull())
    .addColumn('stroke_width', 'integer', (col) => col.notNull())
    .addColumn('data', 'jsonb', (col) => col.notNull())
    .addColumn('created_by', 'text', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await db.schema
    .createIndex('elements_room_id_created_at_idx')
    .on('elements')
    .columns(['room_id', 'created_at'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('elements').execute();
  await db.schema.dropTable('rooms').execute();
}
