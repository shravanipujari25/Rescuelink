import { getGlobalStats, listNGOs } from '../services/public.service.js';
import { asyncHandler } from '../middleware/async.middleware.js';

export const getStats = asyncHandler(async (req, res) => {
    const stats = await getGlobalStats(req.id);
    return res.status(200).json({ success: true, data: stats });
});

export const searchNGOs = asyncHandler(async (req, res) => {
    const { q, service } = req.query;
    const ngos = await listNGOs({ query: q, service }, req.id);
    return res.status(200).json({ success: true, count: ngos.length, data: ngos });
});
