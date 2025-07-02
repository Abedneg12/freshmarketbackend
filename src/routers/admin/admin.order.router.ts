import { Router } from 'express';
// --- 1. Impor controller baru ---
import { 
  getOrdersController, 
  confirmPaymentController,
  shipOrderController // <-- Impor fungsi baru
} from '../../controllers/admin/admin.order.controller';
import { authOnlyMiddleware } from '../../middlewares/authOnlyMiddleware';
import { requireRole } from '../../middlewares/roleMiddleware';
import { validateBody } from '../../middlewares/validationMiddleware';
import { confirmPaymentSchema } from '../../validations/order.admin.validation';

const router = Router();

// Middleware ini berlaku untuk semua rute di bawahnya
router.use([authOnlyMiddleware, requireRole(['SUPER_ADMIN', 'STORE_ADMIN'])]);

// Endpoint untuk mengambil daftar pesanan
router.get('/', getOrdersController);

// Endpoint untuk konfirmasi pembayaran
router.post(
  '/:orderId/confirm', 
  validateBody(confirmPaymentSchema), 
  confirmPaymentController
);

// Endpoint untuk mengirim pesanan
router.post('/:orderId/ship', shipOrderController);

export default router;