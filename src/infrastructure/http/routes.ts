import { Router, type NextFunction, type Request, type Response } from 'express';
import { z } from 'zod';

import type { AppCommandService } from '../../application/command/appCommandService';
import type { AppQueryService } from '../../application/query/appQueryService';
import type { AgentService } from '../../application/service/agentService';
import { HEALTH_PATH } from '../config';
import {
    AppPayloadSchema,
    DeleteAppQuerySchema,
    LifecycleUpdateSchema,
} from './schemas';

export type HttpDeps = {
    appCommands: AppCommandService;
    appQueries: AppQueryService;
    agentService: AgentService;
};

function asyncRoute(
    handler: (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => Promise<unknown>,
) {
    return (req: Request, res: Response, next: NextFunction): void => {
        void handler(req, res, next).catch(next);
    };
}

export function buildRouter(deps: HttpDeps): Router {
    const router = Router();

    router.post('/apps', asyncRoute(async (req: Request, res: Response) => {
        const parsed = AppPayloadSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: 'Invalid payload',
                details: z.treeifyError(parsed.error),
            });
        }

        const record = await deps.appCommands.registerApp(parsed.data);

        return res.status(200).json({ ok: true, app: record });
    }));

    router.patch(
        '/apps/lifecycle',
        asyncRoute(async (req: Request, res: Response) => {
            const parsed = LifecycleUpdateSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    error: 'Invalid payload',
                    details: z.treeifyError(parsed.error),
                });
            }

            const updated = await deps.appCommands.updateAppLifecycle(
                parsed.data,
            );

            return res.status(200).json({ ok: true, app: updated });
        }),
    );

    router.get('/apps', (_req: Request, res: Response) => {
        return res.json(deps.appQueries.listGrouped());
    });

    router.delete('/apps', asyncRoute(async (req: Request, res: Response) => {
        const parsed = DeleteAppQuerySchema.safeParse(req.query);
        if (!parsed.success) {
            return res.status(400).json({
                error: 'Invalid key',
                details: z.treeifyError(parsed.error),
            });
        }

        await deps.appCommands.removeApp(parsed.data.key);

        return res.status(200).json({ ok: true });
    }));

    router.get('/agents', (_req: Request, res: Response) => {
        return res.json(deps.agentService.listGrouped());
    });

    router.get(HEALTH_PATH, (_req, res) => {
        return res.json({ ok: true });
    });

    return router;
}
