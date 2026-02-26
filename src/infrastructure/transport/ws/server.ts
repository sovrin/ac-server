import type { ContainerService } from '@app/container-service';

import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';

import { setupAgentWs } from './agent';
import { setupClientWs } from './client';

export interface ServerOptions {
    port: number;
}

export const startServer = (
    service: ContainerService,
    options: ServerOptions,
): void => {
    const httpServer = createServer((_req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Docker Agent Server\n');
    });

    const agentWss = new WebSocketServer({ noServer: true });
    const clientWss = new WebSocketServer({ noServer: true });

    setupAgentWs(agentWss, service);
    setupClientWs(clientWss, service);

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
        console.log(`[server] Listening on port ${options.port}`);
        console.log(
            `[server]   Agents  → ws://localhost:${options.port}/agent?id=<name>`,
        );
        console.log(
            `[server]   Clients → ws://localhost:${options.port}/client`,
        );
    });
};
