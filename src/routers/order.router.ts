// Di dalam file: src/routers/order.router.ts

import express from 'express';
import { 
    createOrderController, 
    getUserOrdersController,
    uploadPaymentProofController,
    cancelOrderByUserController,
    confirmOrderReceivedController
} from '../controllers/order.controller';
import { validateBody } from '../middlewares/validationMiddleware';
import { checkoutSchema } from '../validations/order.validation';
import { verifiedOnlyMiddleware } from '../middlewares/verifiedOnlyMiddleware';
import { Multer } from '../utils/multer';

const router = express.Router();


router.use(verifiedOnlyMiddleware);


router.post('/', validateBody(checkoutSchema), createOrderController);


router.get('/my', getUserOrdersController);

router.post(
  '/:orderId/payment-proof',
  Multer("memoryStorage").single('paymentProof'),
  uploadPaymentProofController
);

router.post('/my/:orderId/cancel', cancelOrderByUserController);

router.post('/my/:orderId/confirm', confirmOrderReceivedController);


export default router;