"use strict";
// src/controllers/admin/order.admin.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrderController = exports.shipOrderController = exports.confirmPaymentController = exports.getOrdersController = void 0;
// Sesuaikan path import jika struktur folder Anda berbeda
const order_admin_service_1 = require("../../services/admin/order.admin.service");
/**
 * Controller untuk mengambil daftar pesanan dari sisi admin.
 * Fungsi ini mengambil parameter filter dari query string dan data admin dari token,
 * lalu memanggil service untuk mendapatkan data.
 */
const getOrdersController = (req, res) => {
    // Ambil data admin yang sedang login dari middleware otentikasi
    const adminUser = req.user;
    if (!adminUser) {
        res.status(401).json({ message: 'Unauthorized: Admin not found' });
        return;
    }
    // Ambil parameter filter dan pagination dari query string
    const { page, limit, sortBy, sortOrder, status, storeId, orderId, } = req.query;
    // Panggil service dengan membawa data admin dan filter
    (0, order_admin_service_1.getOrdersForAdmin)(adminUser, {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        sortBy: sortBy,
        sortOrder: sortOrder,
        status: status,
        storeId: storeId ? Number(storeId) : undefined,
        orderId: orderId ? Number(orderId) : undefined,
    })
        .then((result) => {
        res.status(200).json(Object.assign({ message: 'Berhasil mengambil daftar pesanan untuk admin' }, result));
    })
        .catch((error) => {
        res.status(500).json({ message: 'Gagal mengambil daftar pesanan', error: error.message });
    });
};
exports.getOrdersController = getOrdersController;
const confirmPaymentController = (req, res) => {
    // Ambil data admin dari token
    const adminUser = req.user;
    if (!adminUser) {
        res.status(401).json({ message: 'Unauthorized: Admin not found' });
        return;
    }
    // Ambil orderId dari parameter URL
    const orderId = Number(req.params.orderId);
    // Ambil keputusan dari body request
    const { decision } = req.body;
    // Validasi input 'decision'
    if (decision !== 'APPROVE' && decision !== 'REJECT') {
        res.status(400).json({ message: "Input 'decision' tidak valid. Harus 'APPROVE' atau 'REJECT'." });
        return;
    }
    // Panggil service untuk menjalankan logika utama
    (0, order_admin_service_1.confirmPayment)(adminUser, orderId, decision)
        .then((updatedOrder) => {
        res.status(200).json({
            message: `Pesanan #${orderId} telah berhasil di-update menjadi ${updatedOrder.status}.`,
            data: updatedOrder,
        });
    })
        .catch((error) => {
        res.status(400).json({ message: error.message });
    });
};
exports.confirmPaymentController = confirmPaymentController;
const shipOrderController = (req, res) => {
    const adminUser = req.user;
    if (!adminUser) {
        res.status(401).json({ message: 'Unauthorized: Admin not found' });
        return;
    }
    const orderId = Number(req.params.orderId);
    (0, order_admin_service_1.shipOrder)(adminUser, orderId)
        .then((updatedOrder) => {
        res.status(200).json({
            message: `Pesanan #${orderId} telah berhasil di-update menjadi ${updatedOrder.status}.`,
            data: updatedOrder,
        });
    })
        .catch((error) => {
        res.status(400).json({ message: error.message });
    });
};
exports.shipOrderController = shipOrderController;
const cancelOrderController = (req, res) => {
    const adminUser = req.user;
    if (!adminUser) {
        res.status(401).json({ message: 'Unauthorized: Admin not found' });
        return;
    }
    const orderId = Number(req.params.orderId);
    (0, order_admin_service_1.cancelOrder)(adminUser, orderId)
        .then((canceledOrder) => {
        res.status(200).json({
            message: `Pesanan #${orderId} telah berhasil dibatalkan.`,
            data: canceledOrder,
        });
    })
        .catch((error) => {
        res.status(400).json({ message: error.message });
    });
};
exports.cancelOrderController = cancelOrderController;
