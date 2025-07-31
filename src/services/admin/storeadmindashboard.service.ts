// src/services/admin/dashboard.admin.service.ts
import { Prisma } from '@prisma/client';
import prisma from '../../lib/prisma';
import { IUserPayload } from '../../interfaces/IUserPayload';

export const getDashboardSummary = async (adminUser: IUserPayload) => {
    // Cari toko yang dikelola oleh admin
    const assignments = await prisma.storeAdminAssignment.findMany({
        where: { userId: adminUser.id },
        select: { storeId: true },
    });
    const assignedStoreIds = assignments.map(a => a.storeId);

    if (assignedStoreIds.length === 0) {
        return { newOrders: 0, lowStockProducts: 0, dailyRevenue: 0 };
    }

    // Hitung jumlah pesanan baru (Menunggu Konfirmasi & Diproses)
    const newOrders = await prisma.order.count({
        where: {
            storeId: { in: assignedStoreIds },
            status: { in: ['WAITING_CONFIRMATION', 'PROCESSED'] },
        },
    });

    // Hitung produk dengan stok rendah (misalnya, di bawah 10)
    const lowStockProducts = await prisma.stock.count({
        where: {
            storeId: { in: assignedStoreIds },
            quantity: { lt: 10 },
        },
    });

    // Hitung pendapatan hari ini (dari pesanan yang sudah selesai/dikirim hari ini)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const revenueResult = await prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: {
            storeId: { in: assignedStoreIds },
            status: { in: ['SHIPPED', 'CONFIRMED'] },
            createdAt: { gte: today },
        },
    });

    return {
        newOrders,
        lowStockProducts,
        dailyRevenue: revenueResult._sum.totalPrice || 0,
    };
};


export const getRecentActivity = async (adminUser: IUserPayload) => {
    const assignments = await prisma.storeAdminAssignment.findMany({
        where: { userId: adminUser.id },
        select: { storeId: true },
    });
    const assignedStoreIds = assignments.map(a => a.storeId);

    if (assignedStoreIds.length === 0) {
        return [];
    }
    const recentActivity = await prisma.orderStatusLog.findMany({
        where: {
            order: {
                storeId: { in: assignedStoreIds },
            },
        },
        take: 5,
        orderBy: {
            changedAt: 'desc', 
        },
        include: {
            order: {
                select: { id: true }
            },
            changedBy: {
                select: { fullName: true }
            }
        }
    });

    return recentActivity;
};
