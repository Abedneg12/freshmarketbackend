// Di dalam file: src/routers/order.router.ts

import express from 'express';
import { 
    createOrderController, 
    getUserOrdersController,
    uploadPaymentProofController,
    cancelOrderByUserController,
    confirmOrderReceivedController,
    getOrderByIdController
} from '../controllers/order.controller';
import { validateBody } from '../middlewares/validationMiddleware';
import { checkoutSchema } from '../validations/order.validation';
import { verifiedOnlyMiddleware } from '../middlewares/verifiedOnlyMiddleware';
import { Multer } from '../utils/multer';

const router = express.Router();

// Semua route di bawah ini hanya bisa diakses oleh user yang sudah login dan terverifikasi
router.use(verifiedOnlyMiddleware);

//route untuk membuat order baru
router.post('/', validateBody(checkoutSchema), createOrderController);

//route untuk mengambil semua order milik user
router.get('/my', getUserOrdersController);
router.get('/my/:orderId', getOrderByIdController);
//route untuk mengupload bukti pembayaran
router.post(
  '/:orderId/payment-proof',
  Multer("memoryStorage").single('paymentProof'),
  uploadPaymentProofController
);


//route untuk membatalkan order oleh user (selama status masih waiting for payment)
router.post('/my/:orderId/cancel', cancelOrderByUserController);


//route untuk mengkonfirmasi penerimaan order oleh user
router.post('/my/:orderId/confirm', confirmOrderReceivedController);


export default router;