"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const order_controller_1 = require("../controllers/order.controller");
const validationMiddleware_1 = require("../middlewares/validationMiddleware");
const order_validation_1 = require("../validations/order.validation");
const verifiedOnlyMiddleware_1 = require("../middlewares/verifiedOnlyMiddleware");
const multer_1 = require("../utils/multer");
const router = express_1.default.Router();
router.post('/midtrans/notification', order_controller_1.handleMidtransNotificationController);
// === Endpoint yang WAJIB login + verifikasi ===
router.post('/', verifiedOnlyMiddleware_1.verifiedOnlyMiddleware, (0, validationMiddleware_1.validateBody)(order_validation_1.checkoutSchema), order_controller_1.createOrderController);
router.get('/my', verifiedOnlyMiddleware_1.verifiedOnlyMiddleware, order_controller_1.getUserOrdersController);
router.get('/my/:orderId', verifiedOnlyMiddleware_1.verifiedOnlyMiddleware, order_controller_1.getOrderByIdController);
router.post('/:orderId/payment-proof', verifiedOnlyMiddleware_1.verifiedOnlyMiddleware, (0, multer_1.Multer)("memoryStorage").single('paymentProof'), order_controller_1.uploadPaymentProofController);
router.post('/my/:orderId/cancel', verifiedOnlyMiddleware_1.verifiedOnlyMiddleware, order_controller_1.cancelOrderByUserController);
router.post('/my/:orderId/confirm', verifiedOnlyMiddleware_1.verifiedOnlyMiddleware, order_controller_1.confirmOrderReceivedController);
exports.default = router;
