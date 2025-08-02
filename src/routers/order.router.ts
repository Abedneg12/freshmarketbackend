// Di dalam file: src/routers/order.router.ts

import express from 'express';
import { 
    createOrderController, 
    getUserOrdersController,
    uploadPaymentProofController,
    cancelOrderByUserController,
    confirmOrderReceivedController,
    getOrderByIdController,
    handleMidtransNotificationController
} from '../controllers/order.controller';
import { validateBody } from '../middlewares/validationMiddleware';
import { checkoutSchema } from '../validations/order.validation';
import { verifiedOnlyMiddleware } from '../middlewares/verifiedOnlyMiddleware';
import { Multer } from '../utils/multer';

const router = express.Router();


router.post('/midtrans/notification', handleMidtransNotificationController);


router.post('/', verifiedOnlyMiddleware, validateBody(checkoutSchema), createOrderController);
router.get('/my', verifiedOnlyMiddleware, getUserOrdersController);
router.get('/my/:orderId', verifiedOnlyMiddleware, getOrderByIdController);
router.post(
  '/:orderId/payment-proof',
  verifiedOnlyMiddleware, Multer("memoryStorage").single('paymentProof'),
  uploadPaymentProofController
);
router.post('/my/:orderId/cancel', verifiedOnlyMiddleware, cancelOrderByUserController);
router.post('/my/:orderId/confirm', verifiedOnlyMiddleware, confirmOrderReceivedController);


export default router;