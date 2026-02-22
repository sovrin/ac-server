import { App, makeAppKey, type AppPayload, type Lifecycle } from '../../domain/app';
import type { AppRepository, Clock } from '../../domain/ports';
import type { AppSnapshotPublisher } from '../ports';
import type { HealthService } from '../healthService';

export class AppCommandService {
    constructor(
        private readonly appRepository: AppRepository,
        private readonly clock: Clock,
        private publisher: AppSnapshotPublisher,
        private readonly healthService: HealthService,
    ) {}

    setPublisher(publisher: AppSnapshotPublisher): void {
        this.publisher = publisher;
    }

    async registerApp(payload: AppPayload) {
        const app = App.registerOrRefresh({
            payload,
            now: this.clock.now(),
            existing: this.appRepository.get(makeAppKey(payload)),
        });
        const record = app.toRecord();
        this.appRepository.set(record.key, record);

        await this.appRepository.save();
        this.publisher.publishAppsSnapshot();
        if (record.lifecycle === 'running') {
            await this.healthService.probeNow(record.key);
        }

        return record;
    }

    async updateAppLifecycle(input: {
        name: string;
        host: string;
        port: number;
        lifecycle: Lifecycle;
    }) {
        const existing = this.appRepository.get(makeAppKey(input));
        const now = this.clock.now();
        const app = existing
            ? App.fromRecord(existing)
            : App.placeholderForLifecycle({ ...input, now });
        if (existing) {
            app.setLifecycle(input.lifecycle, now);
        }
        const record = app.toRecord();
        this.appRepository.set(record.key, record);

        await this.appRepository.save();
        this.publisher.publishAppsSnapshot();
        if (record.lifecycle === 'running') {
            await this.healthService.probeNow(record.key);
        }
        return record;
    }

    async removeApp(key: string): Promise<void> {
        this.appRepository.delete(key);
        await this.appRepository.save();
        this.publisher.publishAppsSnapshot();
    }
}
