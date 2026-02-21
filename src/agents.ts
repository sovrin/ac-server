import { Router } from 'express';

import { getAgents } from './ws';

export const router = Router();

router.get('/agents', (_req, res) => {
    res.json(getAgents());
});
