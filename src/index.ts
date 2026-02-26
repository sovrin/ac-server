import { ContainerService } from '@app/container-service';
import { env } from '@infra/config/env';
import { startServer } from '@infra/transport/ws/server';

const service = new ContainerService();

startServer(service, { port: env.PORT });
