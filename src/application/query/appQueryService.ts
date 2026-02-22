import type { AppRecord } from '../../../domain/app';
import type { AppRepository } from '../../../domain/ports';

export type GroupedApps = Record<string, AppRecord[]>;

export function groupByHost(apps: AppRecord[]): GroupedApps {
    return apps.reduce<GroupedApps>((acc, app) => {
        (acc[app.host] ??= []).push(app);
        return acc;
    }, {});
}

function sortApps(apps: AppRecord[]): AppRecord[] {
    return [...apps].sort((a, b) => {
        if (a.host !== b.host) return a.host.localeCompare(b.host);
        if (a.status !== b.status) return a.status === 'online' ? -1 : 1;
        if (a.port !== b.port) return a.port - b.port;
        return a.name.localeCompare(b.name);
    });
}

export class AppQueryService {
    constructor(private readonly appRepository: AppRepository) {}

    listGrouped(): GroupedApps {
        return groupByHost(sortApps(this.appRepository.list()));
    }
}
