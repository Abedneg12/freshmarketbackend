// Di dalam file: src/routers/order.router.ts

import express from 'express';
import { 
    createOrderController, 
    getUserOrdersController,
    uploadPaymentProofController // <-- 1. Import controller baru
} from '../controllers/order.controller';
import { validateBody } from '../middlewares/validationMiddleware';
import { checkoutSchema } from '../validations/order.validation';
import { verifiedOnlyMiddleware } from '../middlewares/verifiedOnlyMiddleware';
import { Multer } from '../utils/multer';

const router = express.Router();

// Middleware ini berlaku untuk semua rute di bawahnya
router.use(verifiedOnlyMiddleware);

// Rute untuk membuat pesanan baru (sudah ada)
router.post('/', validateBody(checkoutSchema), createOrderController);

// Rute untuk mengambil daftar pesanan user (sudah ada)
router.get('/my', getUserOrdersController);

router.post(
  '/:orderId/payment-proof',
  Multer("memoryStorage").single('paymentProof'),
  uploadPaymentProofController
);

export default router;