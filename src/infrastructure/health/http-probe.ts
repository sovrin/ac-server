import type { AppPayload } from '../../domain/app';
import type { HealthProbe, ProbeResult } from '../../domain/ports';
import { HEALTH_PATH } from '../config';

export class HttpHealthProbe implements HealthProbe {
    constructor(private readonly timeoutMs: number) {}

    async probe(a: AppPayload): Promise<ProbeResult> {
        const url = `http://${a.host}:${a.port}${HEALTH_PATH}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

        const start = performance.now();

        try {
            const resp = await fetch(url, {
                method: 'GET',
                signal: controller.signal,
                headers: { 'cache-control': 'no-cache' },
            });

            const ms = Math.round(performance.now() - start);

            if (resp.ok) {
                return {
                    status: 'online',
                    responseTimeMs: ms,
                    timedOut: false,
                    lastError: null,
                };
            }

            return {
                status: 'offline',
                responseTimeMs: ms,
                timedOut: false,
                lastError: `HTTP ${resp.status}`,
            };
        } catch (err: any) {
            const timedOut = err?.name === 'AbortError';
            return {
                status: 'offline',
                responseTimeMs: null,
                timedOut,
                lastError: timedOut ? 'timeout' : (err?.message ?? 'fetch error'),
            };
        } finally {
            clearTimeout(timeout);
        }
    }
}
