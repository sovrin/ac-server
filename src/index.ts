import express from 'express';
import http from 'node:http';

import { router as agentsRouter } from './agents';
import { router as appsRouter } from './apps';
import {
    CHECK_INTERVAL_MS,
    CHECK_TIMEOUT_MS,
    HEALTH_PATH,
    PORT,
} from './config';
import { runCheckerTick } from './healthcheck';
import { init } from './ws';

const app = express();
app.use(express.json({ limit: '256kb' }));
app.use(appsRouter);
app.use(agentsRouter);

setInterval(() => {
    void runCheckerTick();
}, CHECK_INTERVAL_MS);

const server = http.createServer(app);
init(server);

server.listen(PORT, () => {
    console.log(`LC listening on http://localhost:${PORT}`);
    console.log(
        `Probing ${HEALTH_PATH} every ${CHECK_INTERVAL_MS}ms, timeout ${CHECK_TIMEOUT_MS}ms`,
    );
});
