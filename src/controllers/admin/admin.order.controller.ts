// src/controllers/admin/order.admin.controller.ts

import { Request, Response } from 'express';
// Sesuaikan path import jika struktur folder Anda berbeda
import { getOrdersForAdmin, confirmPayment, shipOrder, cancelOrder} from '../../services/admin/order.admin.service';
import { OrderStatus } from '@prisma/client';
import { TPaymentDecision } from '../../interfaces/admin.interface';

/**
 * Controller untuk mengambil daftar pesanan dari sisi admin.
 * Fungsi ini mengambil parameter filter dari query string dan data admin dari token,
 * lalu memanggil service untuk mendapatkan data.
 */
export const getOrdersController = (req: Request, res: Response): void => {
    // Ambil data admin yang sedang login dari middleware otentikasi
    const adminUser = req.user;

    if (!adminUser) {
        res.status(401).json({ message: 'Unauthorized: Admin not found' });
        return;
    }

    // Ambil parameter filter dan pagination dari query string
    const {
        page,
        limit,
        sortBy,
        sortOrder,
        status,
        storeId,
        orderId,
    } = req.query;

    // Panggil service dengan membawa data admin dan filter
    getOrdersForAdmin(adminUser, {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        sortBy: sortBy as string | undefined,
        sortOrder: sortOrder as 'asc' | 'desc' | undefined,
        status: status as OrderStatus | undefined,
        storeId: storeId ? Number(storeId) : undefined,
        orderId: orderId ? Number(orderId) : undefined,
    })
        .then((result) => {
            res.status(200).json({
                message: 'Berhasil mengambil daftar pesanan untuk admin',
                ...result,
            });
        })
        .catch((error: any) => {
            res.status(500).json({ message: 'Gagal mengambil daftar pesanan', error: error.message });
        });
};


export const confirmPaymentController = (req: Request, res: Response): void => {
    // Ambil data admin dari token
    const adminUser = req.user;
    if (!adminUser) {
        res.status(401).json({ message: 'Unauthorized: Admin not found' });
        return;
    }

    // Ambil orderId dari parameter URL
    const orderId = Number(req.params.orderId);

    // Ambil keputusan dari body request
    const { decision } = req.body as { decision: TPaymentDecision };

    // Validasi input 'decision'
    if (decision !== 'APPROVE' && decision !== 'REJECT') {
        res.status(400).json({ message: "Input 'decision' tidak valid. Harus 'APPROVE' atau 'REJECT'." });
        return;
    }

    // Panggil service untuk menjalankan logika utama
    confirmPayment(adminUser, orderId, decision)
        .then((updatedOrder) => {
            res.status(200).json({
                message: `Pesanan #${orderId} telah berhasil di-update menjadi ${updatedOrder.status}.`,
                data: updatedOrder,
            });
        })
        .catch((error: any) => {
            res.status(400).json({ message: error.message });
        });
};

export const shipOrderController = (req: Request, res: Response): void => {

    const adminUser = req.user;
    if (!adminUser) {
        res.status(401).json({ message: 'Unauthorized: Admin not found' });
        return;
    }


    const orderId = Number(req.params.orderId);

 
    shipOrder(adminUser, orderId)
        .then((updatedOrder) => {
            res.status(200).json({
                message: `Pesanan #${orderId} telah berhasil di-update menjadi ${updatedOrder.status}.`,
                data: updatedOrder,
            });
        })
        .catch((error: any) => {
            res.status(400).json({ message: error.message });
        });
};


export const cancelOrderController = (req: Request, res: Response): void => {

    const adminUser = req.user;
    if (!adminUser) {
        res.status(401).json({ message: 'Unauthorized: Admin not found' });
        return;
    }

    const orderId = Number(req.params.orderId);
    cancelOrder(adminUser, orderId)
        .then((canceledOrder) => {
            res.status(200).json({
                message: `Pesanan #${orderId} telah berhasil dibatalkan.`,
                data: canceledOrder,
            });
        })
        .catch((error: any) => {
            res.status(400).json({ message: error.message });
        });
};
