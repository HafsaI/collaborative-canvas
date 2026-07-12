import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { Database } from './database.types';

export const KYSELY = 'KYSELY_CONNECTION';

@Global()
@Module({
  providers: [
    {
      provide: KYSELY,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dialect = new PostgresDialect({
          pool: new Pool({
            connectionString: config.getOrThrow<string>('DATABASE_URL'),
          }),
        });
        return new Kysely<Database>({ dialect });
      },
    },
  ],
  exports: [KYSELY],
})
export class DatabaseModule {}
