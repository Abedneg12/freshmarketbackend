// src/routers/admin/admin.order.router.ts

import { Router } from 'express';
import { getMonthlySalesReportController, getMonthlySalesByCategoryReportController, getMonthlySalesByProductReportController } from '../controllers/sales.report.controller';
import { authOnlyMiddleware } from '../middlewares/authOnlyMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { UserRole } from '@prisma/client';

const router = Router();

router.use([authOnlyMiddleware, requireRole([UserRole.SUPER_ADMIN, UserRole.STORE_ADMIN])]);

router.get('/monthly-sales', getMonthlySalesReportController);
router.get('/monthly-sales-by-category', getMonthlySalesByCategoryReportController);
router.get('/monthly-sales-by-product', getMonthlySalesByProductReportController);

export default router;