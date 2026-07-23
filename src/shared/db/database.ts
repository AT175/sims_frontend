import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import { modelClasses } from './models';

let databaseInstance: Database | null = null;

export function getDatabase(): Database {
  if (databaseInstance) {
    return databaseInstance;
  }

  const adapter = new SQLiteAdapter({
    schema,
    jsi: true,
    onSetUpError: (error) => {
      console.error('[WatermelonDB] Setup error:', error);
    },
  });

  databaseInstance = new Database({
    adapter,
    modelClasses,
  });

  return databaseInstance;
}

export type { Database };
