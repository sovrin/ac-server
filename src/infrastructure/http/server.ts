import express from 'express';
import http from 'node:http';

import type { HttpDeps } from './routes';
import { buildRouter } from './routes';

export function createHttpServer(deps: HttpDeps): http.Server {
    const app = express();
    app.use(express.json({ limit: '256kb' }));
    app.use(buildRouter(deps));
    app.use(
        (
            err: unknown,
            _req: express.Request,
            res: express.Response,
            _next: express.NextFunction,
        ) => {
            console.error(err);
            if (res.headersSent) return;
            res.status(500).json({ error: 'Internal server error' });
        },
    );

    return http.createServer(app);
}
