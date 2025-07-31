import { Router } from 'express';
import { authOnlyMiddleware } from '../../middlewares/authOnlyMiddleware';
import { requireRole } from '../../middlewares/roleMiddleware';
import { getDashboardSummaryController, getRecentActivityController } from '../../controllers/admin/storeadmin.controller';

const router = Router();
router.use(authOnlyMiddleware, requireRole(['STORE_ADMIN', 'SUPER_ADMIN']));

router.get('/summary', getDashboardSummaryController);
router.get('/recent-activity', getRecentActivityController);
export default router;