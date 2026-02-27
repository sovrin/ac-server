import type { ContainerService } from '@app/container-service';
import type { LoggerFactory, Generator } from '@app/ports';

import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';

import { setupAgentWs } from './agent';
import { setupClientWs } from './client';

export type ServerOptions = {
    port: number;
};

export const startServer = (
    service: ContainerService,
    options: ServerOptions,
    idGenerator: Generator,
    loggerFactory: LoggerFactory,
): void => {
    const log = loggerFactory.create('server:ws');
    const httpServer = createServer((_req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Docker Agent Server\n');
    });

    const agentWss = new WebSocketServer({ noServer: true });
    const clientWss = new WebSocketServer({ noServer: true });

    setupAgentWs(agentWss, service, idGenerator, loggerFactory);
    setupClientWs(clientWss, service, loggerFactory);

    httpServer.on('upgrade', (req, socket, head) => {
        const url = new URL(req.url ?? '/', `http://${req.headers.host}`);

        switch (url.pathname) {
            case '/agent':
                agentWss.handleUpgrade(req, socket, head, (ws) => {
                    agentWss.emit('connection', ws, req);
                });
                break;

            case '/client':
                clientWss.handleUpgrade(req, socket, head, (ws) => {
                    clientWss.emit('connection', ws, req);
                });
                break;

            default:
                socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
                socket.destroy();
        }
    });

    httpServer.listen(options.port, () => {
        log.log(`Listening on port ${options.port}`);
        log.log(`Agents  → ws://localhost:${options.port}/agent?id=<name>`);
        log.log(`Clients → ws://localhost:${options.port}/client`);
    });
};
