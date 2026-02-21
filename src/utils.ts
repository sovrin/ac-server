import { HEALTH_PATH } from './config';
import { Store } from './store';
import type { AppPayload, LifecycleUpdate } from './types';

export function makeKey(a: AppPayload | LifecycleUpdate): string {
    return `${a.host}::${a.name}::${a.port}`;
}

export function buildHealthUrl(a: AppPayload): string {
    return `http://${a.host}:${a.port}${HEALTH_PATH}`;
}

export function groupByHost<T extends { host: string }>(
    items: T[],
): Record<string, T[]> {
    return items.reduce<Record<string, T[]>>((acc, item) => {
        (acc[item.host] ??= []).push(item);
        return acc;
    }, {});
}

export function getGroupedApps(store: Store) {
    const apps = [...store.values()];

    apps.sort((a, b) => {
        if (a.host !== b.host) return a.host.localeCompare(b.host);
        if (a.status !== b.status) return a.status === 'online' ? -1 : 1;
        if (a.port !== b.port) return a.port - b.port;

        return a.name.localeCompare(b.name);
    });

    return groupByHost(apps);
}
