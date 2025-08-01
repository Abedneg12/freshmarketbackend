"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_order_controller_1 = require("../../controllers/admin/admin.order.controller");
const authOnlyMiddleware_1 = require("../../middlewares/authOnlyMiddleware");
const roleMiddleware_1 = require("../../middlewares/roleMiddleware");
const validationMiddleware_1 = require("../../middlewares/validationMiddleware");
const order_admin_validation_1 = require("../../validations/order.admin.validation");
const router = (0, express_1.Router)();
// Middleware ini berlaku untuk semua rute di bawahnya
router.use([authOnlyMiddleware_1.authOnlyMiddleware, (0, roleMiddleware_1.requireRole)(['SUPER_ADMIN', 'STORE_ADMIN'])]);
// Endpoint untuk mengambil daftar pesanan
router.get('/', admin_order_controller_1.getOrdersController);
// Endpoint untuk konfirmasi pembayaran
router.post('/:orderId/confirm', (0, validationMiddleware_1.validateBody)(order_admin_validation_1.confirmPaymentSchema), admin_order_controller_1.confirmPaymentController);
// Endpoint untuk mengirim pesanan
router.post('/:orderId/ship', admin_order_controller_1.shipOrderController);
router.post('/:orderId/cancel', admin_order_controller_1.cancelOrderController);
exports.default = router;
