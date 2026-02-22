import type http from 'node:http';

import type { AgentCommandService } from '../../application/agentCommandService';
import type { AppCommandService } from '../../application/appCommandService';
import type { AppQueryService } from '../../application/appQueryService';
import type { AgentService } from '../../application/agentService';
import { createHttpServer } from '../http/server';
import { WsHubImpl, type WsHub } from '../ws/hub';

export type ServerRuntimeDeps = {
    agentCommands: AgentCommandService;
    appCommands: AppCommandService;
    appQueries: AppQueryService;
    agentService: AgentService;
};

export type ServerRuntime = {
    server: http.Server;
    wsHub: WsHub;
    start(port: number, onListen?: () => void): void;
};

export function createServerRuntime(deps: ServerRuntimeDeps): ServerRuntime {
    const wsHub = new WsHubImpl(deps.appQueries, deps.agentCommands);

    const server = createHttpServer({
        appCommands: deps.appCommands,
        appQueries: deps.appQueries,
        agentService: deps.agentService,
    });

    wsHub.init(server);

    return {
        server,
        wsHub,
        start(port: number, onListen?: () => void): void {
            server.listen(port, onListen);
        },
    };
}
