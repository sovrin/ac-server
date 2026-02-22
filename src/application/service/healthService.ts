import { App } from '../../domain/app';
import type {
    AppRepository,
    Clock,
    HealthProbe,
} from '../../domain/ports';
import type { AppSnapshotPublisher } from '../ports';

export class HealthService {
    private running = false;

    constructor(
        private readonly repo: AppRepository,
        private readonly clock: Clock,
        private readonly probe: HealthProbe,
        private publisher: AppSnapshotPublisher,
    ) {}

    setPublisher(publisher: AppSnapshotPublisher): void {
        this.publisher = publisher;
    }

    async probeNow(key: string): Promise<void> {
        const record = this.repo.get(key);
        if (!record) return;

        if (record.lifecycle !== 'running') {
            return;
        }

        const now = this.clock.now();
        const result = await this.probe.probe(record);
        const app = App.fromRecord(record);
        app.applyProbeResult(result, now);
        this.repo.set(key, app.toRecord());

        await this.repo.save();
        this.publisher.publishAppsSnapshot();
    }

    async runCheckerTick(): Promise<void> {
        if (this.running) return;
        this.running = true;

        try {
            const entries = [...this.repo.entries()];
            const now = this.clock.now();
            let changed = false;

            await Promise.all(
                entries.map(async ([key, record]) => {
                    if (record.lifecycle === 'deleted') return;
                    if (record.lifecycle === 'stopped') {
                        const app = App.fromRecord(record);
                        app.markStopped(now);
                        this.repo.set(key, app.toRecord());
                        changed = true;
                        return;
                    }

                    const r = await this.probe.probe(record);
                    const app = App.fromRecord(record);
                    app.applyProbeResult(r, now);
                    this.repo.set(key, app.toRecord());
                    changed = true;
                }),
            );

            if (changed) {
                await this.repo.save();
                this.publisher.publishAppsSnapshot();
            }
        } finally {
            this.running = false;
        }
    }
}
