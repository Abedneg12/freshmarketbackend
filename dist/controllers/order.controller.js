"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmOrderReceivedController = exports.cancelOrderByUserController = exports.handleMidtransNotificationController = exports.uploadPaymentProofController = exports.getOrderByIdController = exports.getUserOrdersController = exports.createOrderController = void 0;
const orderService = __importStar(require("../services/order.service"));
const cloudinary_1 = require("../utils/cloudinary");
const createOrderController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized - user tidak ditemukan' });
            return;
        }
        const { addressId, paymentMethod, voucherCode, cartItemIds } = req.body;
        if (!addressId || !paymentMethod || !Array.isArray(cartItemIds) || cartItemIds.length === 0) {
            res.status(400).json({
                message: 'addressId, paymentMethod, dan cartItemIds (array) wajib diisi',
            });
            return;
        }
        const result = yield orderService.checkout(req.user.id, Number(addressId), paymentMethod, voucherCode, cartItemIds);
        res.status(201).json({
            message: 'Pesanan berhasil dibuat',
            data: result, // result sudah berisi { order, midtransRedirectUrl? }
        });
    }
    catch (error) {
        console.error('[Create Order Error]', error);
        res.status(500).json({
            message: 'Terjadi kesalahan saat membuat pesanan',
            error: error instanceof Error ? error.message : String(error),
        });
    }
});
exports.createOrderController = createOrderController;
/**
 * Controller untuk mengambil riwayat pesanan milik pengguna yang sedang login.
 */
const getUserOrdersController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const { status, orderId, startDate, endDate, page, limit, sortBy, sortOrder } = req.query;
        const result = yield orderService.getUserOrdersService(req.user.id, {
            status: status,
            orderId: orderId ? Number(orderId) : undefined,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
            sortBy: sortBy || 'createdAt',
            sortOrder: sortOrder || 'desc',
        });
        res.status(200).json(Object.assign({ message: 'Berhasil mengambil daftar pesanan' }, result));
    }
    catch (error) {
        console.error('[Get Orders Error]', error);
        res.status(500).json({
            message: 'Terjadi kesalahan saat mengambil pesanan',
            error: error instanceof Error ? error.message : String(error),
        });
    }
});
exports.getUserOrdersController = getUserOrdersController;
const getOrderByIdController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const orderId = Number(req.params.orderId);
        const order = yield orderService.getOrderById(userId, orderId);
        res.status(200).json({ data: order });
    }
    catch (error) {
        res.status(404).json({ message: error.message });
    }
});
exports.getOrderByIdController = getOrderByIdController;
/**
 * Controller untuk menangani upload bukti pembayaran manual.
 */
const uploadPaymentProofController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderId = Number(req.params.orderId);
        const userId = req.user.id;
        if (!req.file) {
            res.status(400).json({ message: 'File bukti pembayaran wajib diunggah.' });
            return;
        }
        const result = yield (0, cloudinary_1.cloudinaryUpload)(req.file);
        const imageUrl = result.secure_url;
        const order = yield orderService.submitPaymentProof(orderId, userId, imageUrl);
        res.status(200).json({
            message: 'Bukti pembayaran berhasil diunggah. Menunggu konfirmasi admin.',
            data: order
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.uploadPaymentProofController = uploadPaymentProofController;
// --- FUNGSI BARU ---
/**
 * Controller untuk menangani notifikasi webhook dari Midtrans.
 * Menerima body notifikasi dan memanggil service untuk diproses.
 */
const handleMidtransNotificationController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield orderService.handleMidtransNotification(req.body);
        // Beri respons 200 OK agar Midtrans tahu notifikasi sudah diterima.
        res.status(200).json({ message: 'Notification received successfully.' });
    }
    catch (error) {
        console.error('[Midtrans Notification Error]', error);
        // Jika ada error, Midtrans akan mencoba mengirim notifikasi lagi nanti.
        res.status(500).json({ message: error.message });
    }
});
exports.handleMidtransNotificationController = handleMidtransNotificationController;
const cancelOrderByUserController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Ambil data user dari token
        const user = req.user;
        if (!user) {
            // Mengirim respons dan menghentikan eksekusi
            res.status(401).json({ message: 'Unauthorized: Pengguna tidak ditemukan' });
            return;
        }
        // Ambil orderId dari parameter URL
        const orderId = Number(req.params.orderId);
        // Panggil service untuk menjalankan logika utama
        const canceledOrder = yield orderService.cancelOrderByUser(user.id, orderId);
        res.status(200).json({
            message: `Pesanan #${orderId} telah berhasil Anda batalkan.`,
            data: canceledOrder,
        });
    }
    catch (error) {
        // Tangani error yang mungkin dilempar dari service
        res.status(400).json({ message: error.message });
    }
});
exports.cancelOrderByUserController = cancelOrderByUserController;
const confirmOrderReceivedController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Ambil data user dari token
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'Unauthorized: Pengguna tidak ditemukan' });
            return;
        }
        // Ambil orderId dari parameter URL
        const orderId = Number(req.params.orderId);
        // Panggil service untuk menjalankan logika utama
        const confirmedOrder = yield orderService.confirmOrderReceived(user.id, orderId);
        res.status(200).json({
            message: `Pesanan #${orderId} telah berhasil Anda konfirmasi.`,
            data: confirmedOrder,
        });
    }
    catch (error) {
        // Tangani error yang mungkin dilempar dari service
        // (misal: pesanan tidak ditemukan, atau status tidak valid)
        res.status(400).json({ message: error.message });
    }
});
exports.confirmOrderReceivedController = confirmOrderReceivedController;
