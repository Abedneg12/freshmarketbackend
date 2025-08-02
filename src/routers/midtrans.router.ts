import express from 'express';
import { handleMidtransNotificationController } from '../controllers/order.controller';

const router = express.Router();

// Endpoint for handling Midtrans notifications
router.post('/notification', handleMidtransNotificationController);



export default router;