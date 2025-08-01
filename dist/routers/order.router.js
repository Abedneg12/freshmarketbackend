"use strict";
// Di dalam file: src/routers/order.router.ts
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
// Semua route di bawah ini hanya bisa diakses oleh user yang sudah login dan terverifikasi
router.use(verifiedOnlyMiddleware_1.verifiedOnlyMiddleware);
//route untuk membuat order baru
router.post('/', (0, validationMiddleware_1.validateBody)(order_validation_1.checkoutSchema), order_controller_1.createOrderController);
//route untuk mengambil semua order milik user
router.get('/my', order_controller_1.getUserOrdersController);
router.get('/my/:orderId', order_controller_1.getOrderByIdController);
//route untuk mengupload bukti pembayaran
router.post('/:orderId/payment-proof', (0, multer_1.Multer)("memoryStorage").single('paymentProof'), order_controller_1.uploadPaymentProofController);
//route untuk membatalkan order oleh user (selama status masih waiting for payment)
router.post('/my/:orderId/cancel', order_controller_1.cancelOrderByUserController);
//route untuk mengkonfirmasi penerimaan order oleh user
router.post('/my/:orderId/confirm', order_controller_1.confirmOrderReceivedController);
exports.default = router;
