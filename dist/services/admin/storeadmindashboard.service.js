"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentActivity = exports.getDashboardSummary = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const getDashboardSummary = (adminUser) => __awaiter(void 0, void 0, void 0, function* () {
    // Cari toko yang dikelola oleh admin
    const assignments = yield prisma_1.default.storeAdminAssignment.findMany({
        where: { userId: adminUser.id },
        select: { storeId: true },
    });
    const assignedStoreIds = assignments.map(a => a.storeId);
    if (assignedStoreIds.length === 0) {
        return { newOrders: 0, lowStockProducts: 0, dailyRevenue: 0 };
    }
    // Hitung jumlah pesanan baru (Menunggu Konfirmasi & Diproses)
    const newOrders = yield prisma_1.default.order.count({
        where: {
            storeId: { in: assignedStoreIds },
            status: { in: ['WAITING_CONFIRMATION', 'PROCESSED'] },
        },
    });
    // Hitung produk dengan stok rendah (misalnya, di bawah 10)
    const lowStockProducts = yield prisma_1.default.stock.count({
        where: {
            storeId: { in: assignedStoreIds },
            quantity: { lt: 10 },
        },
    });
    // Hitung pendapatan hari ini (dari pesanan yang sudah selesai/dikirim hari ini)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const revenueResult = yield prisma_1.default.order.aggregate({
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
});
exports.getDashboardSummary = getDashboardSummary;
const getRecentActivity = (adminUser) => __awaiter(void 0, void 0, void 0, function* () {
    const assignments = yield prisma_1.default.storeAdminAssignment.findMany({
        where: { userId: adminUser.id },
        select: { storeId: true },
    });
    const assignedStoreIds = assignments.map(a => a.storeId);
    if (assignedStoreIds.length === 0) {
        return [];
    }
    const recentActivity = yield prisma_1.default.orderStatusLog.findMany({
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
});
exports.getRecentActivity = getRecentActivity;
