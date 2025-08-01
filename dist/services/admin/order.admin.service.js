"use strict";
// src/services/admin/order.admin.service.ts -> VERSI LENGKAP
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
exports.autoConfirmShippedOrders = exports.cancelExpiredOrders = exports.cancelOrder = exports.shipOrder = exports.confirmPayment = exports.getOrdersForAdmin = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../lib/prisma"));
const emailorderstatus_1 = require("../../utils/emailorderstatus");
const getOrdersForAdmin = (adminUser, filter) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', status, storeId, orderId } = filter;
    const whereClause = {};
    if (adminUser.role === 'STORE_ADMIN') {
        const assignments = yield prisma_1.default.storeAdminAssignment.findMany({ where: { userId: adminUser.id }, select: { storeId: true } });
        const assignedStoreIds = assignments.map(a => a.storeId);
        if (assignedStoreIds.length === 0) {
            return { data: [], pagination: { total: 0, page, limit, totalPages: 0 } };
        }
        whereClause.storeId = { in: assignedStoreIds };
    }
    else if (adminUser.role === 'SUPER_ADMIN') {
        if (storeId) {
            whereClause.storeId = storeId;
        }
    }
    if (status && Object.values(client_1.OrderStatus).includes(status)) {
        whereClause.status = status;
    }
    if (orderId) {
        whereClause.id = orderId;
    }
    const totalOrders = yield prisma_1.default.order.count({ where: whereClause });
    const orders = yield prisma_1.default.order.findMany({
        where: whereClause,
        include: {
            user: { select: { id: true, fullName: true, email: true } },
            store: true,
            address: true,
            items: { include: { product: { select: { id: true, name: true } } } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
    });
    return { data: orders, pagination: { total: totalOrders, page, limit, totalPages: Math.ceil(totalOrders / limit) } };
});
exports.getOrdersForAdmin = getOrdersForAdmin;
// SERVICE UNTUK KONFIRMASI PEMBAYARAN
const confirmPayment = (adminUser, orderId, decision) => __awaiter(void 0, void 0, void 0, function* () {
    // Logika validasi pesanan tetap sama
    const order = yield prisma_1.default.order.findUnique({ where: { id: orderId } });
    if (!order) {
        throw new Error(`Pesanan dengan ID ${orderId} tidak ditemukan.`);
    }
    if (order.status !== 'WAITING_CONFIRMATION') {
        throw new Error('Hanya pesanan dengan status "Menunggu Konfirmasi" yang bisa diproses.');
    }
    if (adminUser.role === 'STORE_ADMIN') {
        const assignment = yield prisma_1.default.storeAdminAssignment.findFirst({ where: { userId: adminUser.id, storeId: order.storeId } });
        if (!assignment) {
            throw new Error('Forbidden: Anda tidak memiliki akses untuk mengelola pesanan ini.');
        }
    }
    const newStatus = decision === 'APPROVE' ? client_1.OrderStatus.PROCESSED : client_1.OrderStatus.WAITING_FOR_PAYMENT;
    const note = decision === 'APPROVE' ? 'Pembayaran telah dikonfirmasi oleh admin.' : 'Pembayaran ditolak oleh admin. Menunggu bukti pembayaran baru dari user.';
    // Logika transaksi database tetap sama
    const updatedOrder = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const updatedOrderData = yield tx.order.update({ where: { id: orderId }, data: { status: newStatus } });
        yield tx.orderStatusLog.create({
            data: {
                orderId,
                previousStatus: client_1.OrderStatus.WAITING_CONFIRMATION,
                newStatus: newStatus,
                changedById: adminUser.id,
                note: note,
            },
        });
        return updatedOrderData;
    }));
    // --- 2. Tambahkan logika pengiriman email di sini ---
    const user = yield prisma_1.default.user.findUnique({ where: { id: order.userId } });
    if (user) {
        const FE_ORDER_URL = `${process.env.FE_PORT}/orders/${order.id}`;
        if (decision === 'APPROVE') {
            yield (0, emailorderstatus_1.sendOrderStatusEmail)(user.email, `Pembayaran untuk Pesanan #${order.id} Dikonfirmasi`, {
                name: user.fullName,
                orderId: order.id,
                status: 'Pembayaran Dikonfirmasi',
                message: 'Terima kasih! Pembayaran Anda telah kami terima dan pesanan Anda sedang kami siapkan untuk pengiriman.',
                orderUrl: FE_ORDER_URL,
            }, 'orderStatusNotification');
        }
        else { // Jika 'REJECT'
            yield (0, emailorderstatus_1.sendOrderStatusEmail)(user.email, `Pembayaran untuk Pesanan #${order.id} Ditolak`, {
                name: user.fullName,
                orderId: order.id,
                status: 'Pembayaran Ditolak',
                message: 'Mohon maaf, bukti pembayaran yang Anda unggah tidak dapat kami verifikasi. Silakan unggah kembali bukti pembayaran yang valid di halaman detail pesanan.',
                orderUrl: FE_ORDER_URL,
            }, 'orderStatusNotification');
        }
    }
    return updatedOrder;
});
exports.confirmPayment = confirmPayment;
// SERVICE UNTUK MENGIRIM PESANAN (BARU)
const shipOrder = (adminUser, orderId) => __awaiter(void 0, void 0, void 0, function* () {
    // Logika validasi dan transaksi database tetap sama
    const order = yield prisma_1.default.order.findUnique({ where: { id: orderId } });
    if (!order) {
        throw new Error(`Pesanan dengan ID ${orderId} tidak ditemukan.`);
    }
    if (order.status !== 'PROCESSED') {
        throw new Error('Hanya pesanan dengan status "Diproses" yang bisa dikirim.');
    }
    if (adminUser.role === 'STORE_ADMIN') {
        const assignment = yield prisma_1.default.storeAdminAssignment.findFirst({ where: { userId: adminUser.id, storeId: order.storeId } });
        if (!assignment) {
            throw new Error('Forbidden: Anda tidak memiliki akses untuk mengelola pesanan ini.');
        }
    }
    const updatedOrder = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const updatedOrderData = yield tx.order.update({ where: { id: orderId }, data: { status: client_1.OrderStatus.SHIPPED } });
        yield tx.orderStatusLog.create({
            data: {
                orderId,
                previousStatus: client_1.OrderStatus.PROCESSED,
                newStatus: client_1.OrderStatus.SHIPPED,
                changedById: adminUser.id,
                note: 'Pesanan telah dikirim oleh admin.',
            },
        });
        return updatedOrderData;
    }));
    // --- 3. Tambahkan logika pengiriman email di sini ---
    const user = yield prisma_1.default.user.findUnique({ where: { id: order.userId } });
    if (user) {
        const FE_ORDER_URL = `${process.env.FE_PORT}/orders/${order.id}`;
        yield (0, emailorderstatus_1.sendOrderStatusEmail)(user.email, `Pesanan #${order.id} Telah Dikirim!`, {
            name: user.fullName,
            orderId: order.id,
            status: 'Pesanan Dikirim',
            message: 'Pesanan Anda sedang dalam perjalanan menuju alamat tujuan. Mohon konfirmasi jika pesanan sudah Anda terima melalui halaman detail pesanan.',
            orderUrl: FE_ORDER_URL,
        }, 'orderStatusNotification');
    }
    return updatedOrder;
});
exports.shipOrder = shipOrder;
const cancelOrder = (adminUser, orderId) => __awaiter(void 0, void 0, void 0, function* () {
    // Langkah 1: Cari pesanan beserta item-itemnya.
    const order = yield prisma_1.default.order.findUnique({
        where: { id: orderId },
        include: {
            items: true, // Sertakan item pesanan untuk proses pengembalian stok
        },
    });
    if (!order) {
        throw new Error(`Pesanan dengan ID ${orderId} tidak ditemukan.`);
    }
    // Langkah 2: Pastikan pesanan belum dikirim.
    if (order.status === 'SHIPPED' || order.status === 'CONFIRMED') {
        throw new Error('Pesanan yang sudah dikirim atau selesai tidak bisa dibatalkan.');
    }
    // Langkah 3: Jika yang login adalah Store Admin, pastikan dia berhak.
    if (adminUser.role === 'STORE_ADMIN') {
        const assignment = yield prisma_1.default.storeAdminAssignment.findFirst({
            where: {
                userId: adminUser.id,
                storeId: order.storeId,
            },
        });
        if (!assignment) {
            throw new Error('Forbidden: Anda tidak memiliki akses untuk mengelola pesanan ini.');
        }
    }
    // Langkah 4: Lakukan semua perubahan dalam satu transaksi.
    return prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // a. Kembalikan stok untuk setiap item dalam pesanan.
        for (const item of order.items) {
            // Tambah kembali stok di gudang yang bersangkutan
            yield tx.stock.updateMany({
                where: {
                    storeId: order.storeId,
                    productId: item.productId,
                },
                data: {
                    quantity: {
                        increment: item.quantity,
                    },
                },
            });
            // b. Buat jurnal inventaris untuk mencatat pengembalian stok.
            yield tx.inventoryJournal.create({
                data: {
                    productId: item.productId,
                    storeId: order.storeId,
                    type: 'IN', // Stok masuk kembali karena dibatalkan
                    quantity: item.quantity,
                    note: `Pengembalian stok dari pesanan #${orderId} yang dibatalkan.`,
                },
            });
        }
        // c. Ubah status pesanan menjadi CANCELED.
        const canceledOrder = yield tx.order.update({
            where: { id: orderId },
            data: { status: client_1.OrderStatus.CANCELED },
        });
        // d. Catat histori perubahan status.
        yield tx.orderStatusLog.create({
            data: {
                orderId: orderId,
                previousStatus: order.status,
                newStatus: client_1.OrderStatus.CANCELED,
                changedById: adminUser.id,
                note: 'Pesanan dibatalkan oleh admin.',
            },
        });
        return canceledOrder;
    }));
});
exports.cancelOrder = cancelOrder;
const cancelExpiredOrders = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Running cron job: Checking for expired orders...');
    // Tentukan waktu batas (1 jam yang lalu dari sekarang)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    // 1. Cari semua pesanan yang berpotensi kedaluwarsa
    const expiredOrders = yield prisma_1.default.order.findMany({
        where: {
            status: 'WAITING_FOR_PAYMENT',
            paymentMethod: 'BANK_TRANSFER', // Hanya batalkan untuk transfer manual
            createdAt: {
                lt: oneHourAgo, // 'lt' berarti 'less than' atau lebih lama dari
            },
        },
        include: {
            items: true,
        },
    });
    if (expiredOrders.length === 0) {
        console.log('No expired orders found.');
        return;
    }
    console.log(`Found ${expiredOrders.length} expired orders to cancel.`);
    // 2. Batalkan setiap pesanan yang kedaluwarsa
    for (const order of expiredOrders) {
        try {
            yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
                // a. Kembalikan stok untuk setiap item
                for (const item of order.items) {
                    yield tx.stock.updateMany({
                        where: {
                            storeId: order.storeId,
                            productId: item.productId,
                        },
                        data: {
                            quantity: { increment: item.quantity },
                        },
                    });
                    // b. Buat jurnal inventaris
                    yield tx.inventoryJournal.create({
                        data: {
                            productId: item.productId,
                            storeId: order.storeId,
                            type: 'IN',
                            quantity: item.quantity,
                            note: `Stok dikembalikan dari pesanan kedaluwarsa #${order.id}.`,
                        },
                    });
                }
                // c. Ubah status pesanan menjadi CANCELED
                yield tx.order.update({
                    where: { id: order.id },
                    data: { status: client_1.OrderStatus.CANCELED },
                });
                // d. Catat histori perubahan status
                yield tx.orderStatusLog.create({
                    data: {
                        orderId: order.id,
                        previousStatus: order.status,
                        newStatus: client_1.OrderStatus.CANCELED,
                        changedById: null, // Dibatalkan oleh sistem
                        note: 'Pesanan dibatalkan otomatis oleh sistem karena melewati batas waktu pembayaran.',
                    },
                });
            }));
            console.log(`Order #${order.id} has been canceled successfully.`);
        }
        catch (error) {
            console.error(`Failed to cancel order #${order.id}:`, error);
        }
    }
});
exports.cancelExpiredOrders = cancelExpiredOrders;
const autoConfirmShippedOrders = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Running cron job: Checking for auto-confirmable orders...');
    // Tentukan waktu batas (7 hari yang lalu dari sekarang)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    // 1. Cari semua pesanan yang statusnya masih SHIPPED.
    const shippedOrders = yield prisma_1.default.order.findMany({
        where: {
            status: 'SHIPPED',
        },
        // Sertakan log status untuk memeriksa kapan pesanan tersebut dikirim.
        include: {
            statusLogs: {
                where: {
                    newStatus: 'SHIPPED',
                },
                orderBy: {
                    changedAt: 'desc', // Ambil log pengiriman yang paling baru
                },
                take: 1,
            },
        },
    });
    if (shippedOrders.length === 0) {
        console.log('No shipped orders found to check.');
        return;
    }
    // 2. Filter pesanan yang waktu pengirimannya sudah lebih dari 7 hari yang lalu.
    const ordersToConfirm = shippedOrders.filter(order => {
        // Pastikan ada log pengiriman dan tanggalnya sudah lewat batas
        return order.statusLogs.length > 0 && order.statusLogs[0].changedAt < sevenDaysAgo;
    });
    if (ordersToConfirm.length === 0) {
        console.log('No orders eligible for auto-confirmation.');
        return;
    }
    console.log(`Found ${ordersToConfirm.length} orders to auto-confirm.`);
    // 3. Konfirmasi setiap pesanan yang memenuhi syarat.
    for (const order of ordersToConfirm) {
        try {
            yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
                // a. Ubah status pesanan menjadi CONFIRMED
                yield tx.order.update({
                    where: { id: order.id },
                    data: { status: client_1.OrderStatus.CONFIRMED },
                });
                // b. Catat histori perubahan status
                yield tx.orderStatusLog.create({
                    data: {
                        orderId: order.id,
                        previousStatus: client_1.OrderStatus.SHIPPED,
                        newStatus: client_1.OrderStatus.CONFIRMED,
                        changedById: null, // Dikonfirmasi oleh sistem
                        note: 'Pesanan dikonfirmasi otomatis oleh sistem setelah 7 hari.',
                    },
                });
            }));
            console.log(`Order #${order.id} has been auto-confirmed successfully.`);
        }
        catch (error) {
            console.error(`Failed to auto-confirm order #${order.id}:`, error);
        }
    }
});
exports.autoConfirmShippedOrders = autoConfirmShippedOrders;
