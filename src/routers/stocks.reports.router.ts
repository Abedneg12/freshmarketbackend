import { Router } from 'express';
import { getMonthlyStockDetailReportController,getMonthlyStockSummaryReportController } from '../controllers/stocks.reports.controller';
import { authOnlyMiddleware } from '../middlewares/authOnlyMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { UserRole } from '@prisma/client';

const router = Router();

router.use([authOnlyMiddleware, requireRole([UserRole.SUPER_ADMIN, UserRole.STORE_ADMIN])]);

router.get('/monthly-stock-summary', getMonthlyStockSummaryReportController);
router.get('/monthly-stock-detail', getMonthlyStockDetailReportController);

export default router;