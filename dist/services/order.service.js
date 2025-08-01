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
exports.confirmOrderReceived = exports.cancelOrderByUser = exports.handleMidtransNotification = exports.submitPaymentProof = exports.getOrderById = exports.getUserOrdersService = exports.checkout = void 0;
const midtrans_client_1 = __importDefault(require("midtrans-client"));
const config_1 = require("../config");
const prisma_1 = __importDefault(require("../lib/prisma"));
const client_1 = require("@prisma/client");
// ===================================================================================
// INISIALISASI MIDTRANS CLIENT
// ===================================================================================
const snap = new midtrans_client_1.default.Snap({
    isProduction: false,
    serverKey: config_1.MIDTRANS_SERVER_KEY,
    clientKey: config_1.MIDTRANS_CLIENT_KEY,
});
// ===================================================================================
// FUNGSI UTILITAS
// ===================================================================================
function getDistanceMeters(lat1, lng1, lat2, lng2) {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371000;
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lng2 - lng1);
    const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
// ===================================================================================
// SERVICE UNTUK CHECKOUT (VERSI DISEMPURNAKAN)
// ===================================================================================
const checkout = (userId_1, addressId_1, paymentMethod_1, voucherCode_1, ...args_1) => __awaiter(void 0, [userId_1, addressId_1, paymentMethod_1, voucherCode_1, ...args_1], void 0, function* (userId, addressId, paymentMethod, voucherCode, cartItemIds = []) {
    var _a, _b;
    // 1. Validasi data awal
    const [user, address] = yield Promise.all([
        prisma_1.default.user.findUnique({ where: { id: userId } }),
        prisma_1.default.address.findUnique({ where: { id: addressId, userId } })
    ]);
    if (!user)
        throw new Error('Pengguna tidak ditemukan.');
    if (!address)
        throw new Error('Alamat tidak ditemukan.');
    const selectedItems = yield prisma_1.default.cartItem.findMany({
        where: { id: { in: cartItemIds }, cart: { userId } },
        include: { product: true, cart: true },
    });
    if (selectedItems.length === 0)
        throw new Error('Item keranjang tidak ditemukan.');
    // 2. Logika bisnis (pencarian toko, kalkulasi harga)
    const stores = yield prisma_1.default.store.findMany();
    const nearbyStores = stores
        .map((s) => (Object.assign(Object.assign({}, s), { distance: getDistanceMeters(address.latitude, address.longitude, s.latitude, s.longitude) })))
        .filter((s) => s.distance <= 7000)
        .sort((a, b) => a.distance - b.distance);
    if (nearbyStores.length === 0)
        throw new Error('Tidak ada gudang dalam jarak 7 km.');
    let chosenStore = null;
    for (const store of nearbyStores) {
        const hasAllStock = yield Promise.all(selectedItems.map(item => prisma_1.default.stock.findFirst({ where: { storeId: store.id, productId: item.productId, quantity: { gte: item.quantity } } })));
        if (hasAllStock.every(stock => stock !== null)) {
            chosenStore = store;
            break;
        }
    }
    if (!chosenStore)
        throw new Error('Tidak ada gudang dengan stok mencukupi dalam radius 7 km.');
    const subtotal = selectedItems.reduce((sum, item) => sum + (item.product.basePrice * item.quantity), 0);
    const shippingCost = Math.ceil(chosenStore.distance / 1000) * 5000;
    let voucherId = null;
    let voucherDiscount = 0;
    if (voucherCode) {
        const voucher = yield prisma_1.default.voucher.findUnique({ where: { code: voucherCode } });
        if (voucher && voucher.isActive && subtotal >= ((_a = voucher.minSpending) !== null && _a !== void 0 ? _a : 0) && new Date() >= voucher.startDate && new Date() <= voucher.endDate) {
            voucherId = voucher.id;
            voucherDiscount = Math.min(voucher.value, (_b = voucher.maxDiscount) !== null && _b !== void 0 ? _b : voucher.value);
        }
    }
    const totalPrice = subtotal + shippingCost - voucherDiscount;
    // 3. Buat pesanan di database
    const order = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const newOrder = yield tx.order.create({
            data: {
                userId,
                storeId: chosenStore.id,
                addressId,
                totalPrice,
                shippingCost,
                voucherId,
                paymentMethod,
                status: client_1.OrderStatus.WAITING_FOR_PAYMENT,
            },
        });
        if (voucherId) {
            yield tx.userVoucher.updateMany({ where: { userId, voucherId, isUsed: false }, data: { isUsed: true } });
        }
        yield Promise.all(selectedItems.map(item => tx.orderItem.create({ data: { orderId: newOrder.id, productId: item.productId, quantity: item.quantity, price: item.product.basePrice } })));
        yield Promise.all(selectedItems.map(item => tx.stock.updateMany({ where: { storeId: chosenStore.id, productId: item.productId }, data: { quantity: { decrement: item.quantity } } })));
        yield tx.cartItem.deleteMany({ where: { id: { in: cartItemIds } } });
        yield tx.orderStatusLog.create({ data: { orderId: newOrder.id, previousStatus: client_1.OrderStatus.WAITING_FOR_PAYMENT, newStatus: client_1.OrderStatus.WAITING_FOR_PAYMENT, changedById: userId, note: 'Order created' } });
        return newOrder;
    }));
    // 4. Proses pembayaran
    if (paymentMethod === 'MIDTRANS') {
        const item_details = selectedItems.map(item => ({
            id: item.product.id.toString(),
            price: item.product.basePrice,
            quantity: item.quantity,
            name: item.product.name,
        }));
        if (shippingCost > 0) {
            item_details.push({ id: 'SHIPPING_COST', price: shippingCost, quantity: 1, name: 'Biaya Pengiriman' });
        }
        if (voucherDiscount > 0) {
            item_details.push({ id: 'VOUCHER_DISCOUNT', price: -voucherDiscount, quantity: 1, name: `Voucher (${voucherCode})` });
        }
        const parameter = {
            transaction_details: {
                order_id: order.id.toString(),
                gross_amount: order.totalPrice,
            },
            item_details,
            customer_details: {
                first_name: user.fullName,
                email: user.email,
            }
        };
        const transaction = yield snap.createTransaction(parameter);
        return { order, midtransRedirectUrl: transaction.redirect_url };
    }
    return { order };
});
exports.checkout = checkout;
// SERVICE UNTUK FUNGSI LAIN
const getUserOrdersService = (userId, filter) => __awaiter(void 0, void 0, void 0, function* () {
    const { status, orderId, startDate, endDate, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = filter;
    const whereClause = { userId };
    if (status && Object.values(client_1.OrderStatus).includes(status))
        whereClause.status = status;
    if (orderId)
        whereClause.id = orderId;
    if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate)
            whereClause.createdAt.gte = startDate;
        if (endDate)
            whereClause.createdAt.lte = endDate;
    }
    const totalOrders = yield prisma_1.default.order.count({ where: whereClause });
    const orders = yield prisma_1.default.order.findMany({
        where: whereClause,
        include: { items: { include: { product: true } }, address: true, store: true, voucher: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
    });
    return { data: orders, pagination: { page, limit, total: totalOrders, totalPages: Math.ceil(totalOrders / limit) } };
});
exports.getUserOrdersService = getUserOrdersService;
const getOrderById = (userId, orderId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield prisma_1.default.order.findFirst({
            where: {
                id: orderId,
                userId: userId,
            },
            include: {
                address: true,
                items: {
                    include: {
                        product: {
                            include: {
                                images: true
                            }
                        }
                    }
                }
            }
        });
        if (!order) {
            throw new Error("Pesanan tidak ditemukan atau Anda tidak memiliki izin untuk melihatnya.");
        }
        return order;
    }
    catch (err) {
        console.error("Error fetching order by id:", err);
        throw new Error("Gagal mengambil detail pesanan.");
    }
});
exports.getOrderById = getOrderById;
const submitPaymentProof = (orderId, userId, imageUrl) => __awaiter(void 0, void 0, void 0, function* () {
    // Fungsi ini tidak berubah
    const order = yield prisma_1.default.order.findFirst({ where: { id: orderId, userId: userId } });
    if (!order)
        throw new Error('Pesanan tidak ditemukan atau Anda tidak memiliki akses ke pesanan ini.');
    if (order.status !== 'WAITING_FOR_PAYMENT')
        throw new Error('Hanya pesanan dengan status "Menunggu Pembayaran" yang dapat diunggah bukti bayarnya.');
    const updatedOrder = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        yield tx.paymentProof.create({ data: { orderId: orderId, imageUrl: imageUrl } });
        const newOrderState = yield tx.order.update({ where: { id: orderId }, data: { status: client_1.OrderStatus.WAITING_CONFIRMATION } });
        yield tx.orderStatusLog.create({ data: { orderId: orderId, previousStatus: client_1.OrderStatus.WAITING_FOR_PAYMENT, newStatus: client_1.OrderStatus.WAITING_CONFIRMATION, changedById: userId, note: 'User telah mengunggah bukti pembayaran.' } });
        return newOrderState;
    }));
    return updatedOrder;
});
exports.submitPaymentProof = submitPaymentProof;
// SERVICE UNTUK NOTIFIKASI MIDTRANS (BARU)
const handleMidtransNotification = (notification) => __awaiter(void 0, void 0, void 0, function* () {
    const statusResponse = yield snap.transaction.notification(notification);
    const orderId = Number(statusResponse.order_id);
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;
    const order = yield prisma_1.default.order.findUnique({ where: { id: orderId } });
    if (!order)
        throw new Error(`Pesanan dengan ID ${orderId} tidak ditemukan.`);
    if (order.status === 'CONFIRMED' || order.status === 'CANCELED' || order.status === 'PROCESSED') {
        console.log(`Pesanan ${orderId} sudah memiliki status final, notifikasi diabaikan.`);
        return;
    }
    let newStatus = null;
    const note = `Status pembayaran diperbarui oleh Midtrans: ${transactionStatus}. Status fraud: ${fraudStatus}.`;
    if (transactionStatus == 'capture' || transactionStatus == 'settlement') {
        if (fraudStatus == 'accept') {
            newStatus = client_1.OrderStatus.PROCESSED;
        }
    }
    else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
        newStatus = client_1.OrderStatus.CANCELED;
    }
    if (newStatus) {
        yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            yield tx.order.update({ where: { id: orderId }, data: { status: newStatus } });
            yield tx.orderStatusLog.create({
                data: {
                    orderId: orderId,
                    previousStatus: order.status,
                    newStatus: newStatus,
                    changedById: null,
                    note: note,
                },
            });
        }));
    }
});
exports.handleMidtransNotification = handleMidtransNotification;
const cancelOrderByUser = (userId, orderId) => __awaiter(void 0, void 0, void 0, function* () {
    // Langkah 1: Cari pesanan beserta item-itemnya, dan pastikan milik user.
    const order = yield prisma_1.default.order.findFirst({
        where: {
            id: orderId,
            userId: userId
        },
        include: {
            items: true, // Sertakan item pesanan untuk proses pengembalian stok
        },
    });
    if (!order) {
        throw new Error(`Pesanan dengan ID ${orderId} tidak ditemukan atau bukan milik Anda.`);
    }
    // Langkah 2: Validasi status pesanan sesuai dokumen.
    if (order.status !== 'WAITING_FOR_PAYMENT') {
        throw new Error('Pesanan hanya bisa dibatalkan jika statusnya "Menunggu Pembayaran".');
    }
    // Langkah 3: Lakukan semua perubahan dalam satu transaksi database.
    return prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // a. Kembalikan stok untuk setiap item dalam pesanan.
        for (const item of order.items) {
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
                    type: 'IN', // Stok masuk kembali
                    quantity: item.quantity,
                    note: `Pengembalian stok dari pesanan #${orderId} yang dibatalkan oleh pengguna.`,
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
                changedById: userId, // Aksi dilakukan oleh pengguna
                note: 'Pesanan dibatalkan oleh pengguna.',
            },
        });
        return canceledOrder;
    }));
});
exports.cancelOrderByUser = cancelOrderByUser;
const confirmOrderReceived = (userId, orderId) => __awaiter(void 0, void 0, void 0, function* () {
    // Langkah 1: Cari pesanan dan pastikan milik user yang benar.
    const order = yield prisma_1.default.order.findFirst({
        where: {
            id: orderId,
            userId: userId,
        },
    });
    if (!order) {
        throw new Error(`Pesanan dengan ID ${orderId} tidak ditemukan atau bukan milik Anda.`);
    }
    // Langkah 2: Validasi status. Hanya pesanan yang sudah dikirim yang bisa dikonfirmasi.
    if (order.status !== 'SHIPPED') {
        throw new Error('Hanya pesanan dengan status "Dikirim" yang bisa dikonfirmasi.');
    }
    // Langkah 3: Lakukan perubahan dalam satu transaksi.
    return prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // a. Ubah status pesanan menjadi CONFIRMED.
        const confirmedOrder = yield tx.order.update({
            where: { id: orderId },
            data: { status: client_1.OrderStatus.CONFIRMED },
        });
        // b. Catat histori perubahan status.
        yield tx.orderStatusLog.create({
            data: {
                orderId: orderId,
                previousStatus: client_1.OrderStatus.SHIPPED,
                newStatus: client_1.OrderStatus.CONFIRMED,
                changedById: userId, // Aksi dilakukan oleh pengguna
                note: 'Pesanan dikonfirmasi diterima oleh pengguna.',
            },
        });
        return confirmedOrder;
    }));
});
exports.confirmOrderReceived = confirmOrderReceived;
