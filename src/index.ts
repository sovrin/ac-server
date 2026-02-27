import { ContainerService } from '@app/container-service';
import { env } from '@infra/config/env';
import { idGenerator } from '@infra/generator/id-generator';
import { debugLoggerFactory } from '@infra/logging/logger-factory';
import { clientUpdatePublisher } from '@infra/messaging/client-update-bus';
import { systemClock } from '@infra/time/system-clock';
import { startServer } from '@infra/transport/ws/server';

const service = new ContainerService({
    clock: systemClock,
    logger: debugLoggerFactory,
    publisher: clientUpdatePublisher,
});

startServer({
    idGenerator,
    loggerFactory: debugLoggerFactory,
    options: { port: env.PORT },
    service,
});
