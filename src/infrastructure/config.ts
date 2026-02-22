export const CHECK_INTERVAL_MS = Number(
    process.env.CHECK_INTERVAL_MS ?? 60_000 * 3,
);
export const CHECK_TIMEOUT_MS = Number(process.env.CHECK_TIMEOUT_MS ?? 2_000);
export const HEALTH_PATH = process.env.HEALTH_PATH ?? '/health';
export const PORT = Number(process.env.PORT ?? 8080);
export const DB_PATH = process.env.DB_PATH ?? './data/db.json';
