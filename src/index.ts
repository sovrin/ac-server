import { AgentCommandService } from './application/command/agentCommandService';
import { AppCommandService } from './application/command/appCommandService';
import { AppQueryService } from './application/query/appQueryService';
import { AgentService } from './application/service/agentService';
import { HealthService } from './application/service/healthService';
import { systemClock } from './infrastructure/clock';
import {
    CHECK_INTERVAL_MS,
    CHECK_TIMEOUT_MS,
    DB_PATH,
    PORT,
} from './infrastructure/config';
import { HttpHealthProbe } from './infrastructure/health/http-probe';
import { createLowdbRepositories } from './infrastructure/persistence/lowdb';
import { createInMemoryRepositories } from './infrastructure/persistence/memory';
import { createServerRuntime } from './infrastructure/server/runtime';

async function main(): Promise<void> {
    const { appRepository, agentRepository } = process.env.USE_IN_MEMORY_STORE
        ? await createInMemoryRepositories()
        : await createLowdbRepositories(DB_PATH);

    const appQueries = new AppQueryService(appRepository);
    const agentService = new AgentService(agentRepository);
    const agentCommands = new AgentCommandService(agentRepository, systemClock);
    const healthService = new HealthService(
        appRepository,
        systemClock,
        new HttpHealthProbe(CHECK_TIMEOUT_MS),
        {
            publishAppsSnapshot(): void {},
        },
    );
    const appCommands = new AppCommandService(
        appRepository,
        systemClock,
        {
            publishAppsSnapshot(): void {},
        },
        healthService,
    );

    const runtime = createServerRuntime({
        agentCommands,
        appCommands,
        appQueries,
        agentService,
    });

    appCommands.setPublisher(runtime.wsHub);
    healthService.setPublisher(runtime.wsHub);

    setInterval(() => {
        void healthService.runCheckerTick();
    }, CHECK_INTERVAL_MS);

    runtime.start(PORT, () => {
        console.log(`AC server listening on http://localhost:${PORT}`);
    });
}

void main();
