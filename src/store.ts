import { JSONFilePreset } from 'lowdb/node';

import { DB_PATH } from './config';
import type { AppRecord } from './types';

type DbSchema = {
    apps: Record<string, AppRecord>;
};

const defaultData: DbSchema = { apps: {} };

const db = await JSONFilePreset<DbSchema>(DB_PATH, defaultData);

export const store = {
    get(key: string): AppRecord | undefined {
        return db.data.apps[key];
    },

    set(key: string, record: AppRecord): void {
        db.data.apps[key] = record;
    },

    delete(key: string): void {
        delete db.data.apps[key];
    },

    values(): AppRecord[] {
        return Object.values(db.data.apps);
    },

    entries(): [string, AppRecord][] {
        return Object.entries(db.data.apps);
    },

    get size(): number {
        return Object.keys(db.data.apps).length;
    },

    /** Flush current state to disk. Call after mutations. */
    async save(): Promise<void> {
        await db.write();
    },
};

export type Store = typeof store;

console.log(`Store loaded from ${DB_PATH} (${store.size} app(s))`);
