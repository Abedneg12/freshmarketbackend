import midtransClient from 'midtrans-client';
import { MIDTRANS_CLIENT_KEY, MIDTRANS_SERVER_KEY } from '../config';
import prisma from '../lib/prisma';
import { Prisma, OrderStatus } from '@prisma/client';
import { GetUserOrdersFilter } from '../interfaces/order.interface';


const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: MIDTRANS_SERVER_KEY,
  clientKey: MIDTRANS_CLIENT_KEY,
});


function getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371000;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lng2 - lng1);
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}


export const checkout = async (
  userId: number,
  addressId: number,
  paymentMethod: string,
  voucherCode?: string,
  cartItemIds: number[] = []
) => {
  // 1. Validasi data awal
  const [user, address] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.address.findUnique({ where: { id: addressId, userId } })
  ]);
  if (!user) throw new Error('Pengguna tidak ditemukan.');
  if (!address) throw new Error('Alamat tidak ditemukan.');

  const selectedItems = await prisma.cartItem.findMany({
    where: { id: { in: cartItemIds }, cart: { userId } },
    include: { product: true, cart: true },
  });
  if (selectedItems.length === 0) throw new Error('Item keranjang tidak ditemukan.');

  // 2. Logika bisnis (pencarian toko, kalkulasi harga)
  const stores = await prisma.store.findMany();
  const nearbyStores = stores
    .map((s) => ({ ...s, distance: getDistanceMeters(address.latitude, address.longitude, s.latitude, s.longitude) }))
    .filter((s) => s.distance <= 7000)
    .sort((a, b) => a.distance - b.distance);
  if (nearbyStores.length === 0) throw new Error('Tidak ada gudang dalam jarak 7 km.');

  let chosenStore: (typeof nearbyStores)[0] | null = null;
  for (const store of nearbyStores) {
    const hasAllStock = await Promise.all(selectedItems.map(item => 
      prisma.stock.findFirst({ where: { storeId: store.id, productId: item.productId, quantity: { gte: item.quantity } } })
    ));
    if (hasAllStock.every(stock => stock !== null)) {
      chosenStore = store;
      break;
    }
  }
  if (!chosenStore) throw new Error('Tidak ada gudang dengan stok mencukupi dalam radius 7 km.');

  const subtotal = selectedItems.reduce((sum, item) => sum + (item.product.basePrice * item.quantity), 0);
  const shippingCost = 5000;
  
  let voucherId: number | null = null;
  let voucherDiscount = 0;
  if (voucherCode) {
    const voucher = await prisma.voucher.findUnique({ where: { code: voucherCode } });
    if (voucher && voucher.isActive && subtotal >= (voucher.minSpending ?? 0) && new Date() >= voucher.startDate && new Date() <= voucher.endDate) {
      voucherId = voucher.id;
      voucherDiscount = Math.min(voucher.value, voucher.maxDiscount ?? voucher.value);
    }
  }
  const totalPrice = subtotal + shippingCost - voucherDiscount;

 
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        userId,
        storeId: chosenStore!.id,
        addressId,
        totalPrice,
        shippingCost,
        voucherId,
        paymentMethod,
        status: OrderStatus.WAITING_FOR_PAYMENT,
      },
    });
    if (voucherId) {
      await tx.userVoucher.updateMany({ where: { userId, voucherId, isUsed: false }, data: { isUsed: true } });
    }
    await Promise.all(selectedItems.map(item => 
      tx.orderItem.create({ data: { orderId: newOrder.id, productId: item.productId, quantity: item.quantity, price: item.product.basePrice } })
    ));
    await Promise.all(selectedItems.map(item => 
      tx.stock.updateMany({ where: { storeId: chosenStore!.id, productId: item.productId }, data: { quantity: { decrement: item.quantity } } })
    ));
    await tx.cartItem.deleteMany({ where: { id: { in: cartItemIds } } });
    await tx.orderStatusLog.create({ data: { orderId: newOrder.id, previousStatus: OrderStatus.WAITING_FOR_PAYMENT, newStatus: OrderStatus.WAITING_FOR_PAYMENT, changedById: userId, note: 'Order created' } });
    return newOrder;
  });


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
    const transaction = await snap.createTransaction(parameter);
    return { order, midtransRedirectUrl: transaction.redirect_url };
  }

  return { order };
};



export const getUserOrdersService = async (userId: number, filter: GetUserOrdersFilter) => {
  const { status, orderId, startDate, endDate, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = filter;
  const whereClause: Prisma.OrderWhereInput = { userId };
  if (status && Object.values(OrderStatus).includes(status as OrderStatus)) whereClause.status = status as OrderStatus;
  if (orderId) whereClause.id = orderId;
  if (startDate || endDate) {
    whereClause.createdAt = {};
    if (startDate) whereClause.createdAt.gte = startDate;
    if (endDate) whereClause.createdAt.lte = endDate;
  }
  const totalOrders = await prisma.order.count({ where: whereClause });
  const orders = await prisma.order.findMany({
    where: whereClause,
    include: { items: { include: { product: true } }, address: true, store: true, voucher: true },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
  });
  return { data: orders, pagination: { page, limit, total: totalOrders, totalPages: Math.ceil(totalOrders / limit) } };
};

export const getOrderById = async (userId: number, orderId: number) => {
  try {
    const order = await prisma.order.findFirst({
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
  } catch (err) {
    console.error("Error fetching order by id:", err);
    throw new Error("Gagal mengambil detail pesanan.");
  }
};

export const submitPaymentProof = async (orderId: number, userId: number, imageUrl: string) => {
 
  const order = await prisma.order.findFirst({ where: { id: orderId, userId: userId } });
  if (!order) throw new Error('Pesanan tidak ditemukan atau Anda tidak memiliki akses ke pesanan ini.');
  if (order.status !== 'WAITING_FOR_PAYMENT') throw new Error('Hanya pesanan dengan status "Menunggu Pembayaran" yang dapat diunggah bukti bayarnya.');
  const updatedOrder = await prisma.$transaction(async (tx) => {
    await tx.paymentProof.create({ data: { orderId: orderId, imageUrl: imageUrl } });
    const newOrderState = await tx.order.update({ where: { id: orderId }, data: { status: OrderStatus.WAITING_CONFIRMATION } });
    await tx.orderStatusLog.create({ data: { orderId: orderId, previousStatus: OrderStatus.WAITING_FOR_PAYMENT, newStatus: OrderStatus.WAITING_CONFIRMATION, changedById: userId, note: 'User telah mengunggah bukti pembayaran.' } });
    return newOrderState;
  });
  return updatedOrder;
};



export const handleMidtransNotification = async (notification: any) => {
  const statusResponse = await snap.transaction.notification(notification);
  const orderId = Number(statusResponse.order_id);
  const transactionStatus = statusResponse.transaction_status;
  const fraudStatus = statusResponse.fraud_status;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error(`Pesanan dengan ID ${orderId} tidak ditemukan.`);

  if (order.status === 'CONFIRMED' || order.status === 'CANCELED' || order.status === 'PROCESSED') {
    console.log(`Pesanan ${orderId} sudah memiliki status final, notifikasi diabaikan.`);
    return;
  }

  let newStatus: OrderStatus | null = null;
  const note = `Status pembayaran diperbarui oleh Midtrans: ${transactionStatus}. Status fraud: ${fraudStatus}.`;
  
  if (transactionStatus == 'capture' || transactionStatus == 'settlement') {
    if (fraudStatus == 'accept') {
      newStatus = OrderStatus.PROCESSED;
    }
  } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
    newStatus = OrderStatus.CANCELED;
  }

  if (newStatus) {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: orderId }, data: { status: newStatus! } });
      await tx.orderStatusLog.create({
        data: {
          orderId: orderId,
          previousStatus: order.status,
          newStatus: newStatus!,
          changedById: null,
          note: note,
        },
      });
    });
  }
};


export const cancelOrderByUser = async (userId: number, orderId: number) => {
  const order = await prisma.order.findFirst({
    where: { 
      id: orderId,
      userId: userId 
    },
    include: {
      items: true,
    },
  });

  if (!order) {
    throw new Error(`Pesanan dengan ID ${orderId} tidak ditemukan atau bukan milik Anda.`);
  }

 
  if (order.status !== 'WAITING_FOR_PAYMENT') {
    throw new Error('Pesanan hanya bisa dibatalkan jika statusnya "Menunggu Pembayaran".');
  }


  return prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      await tx.stock.updateMany({
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

      await tx.inventoryJournal.create({
        data: {
          productId: item.productId,
          storeId: order.storeId,
          type: 'IN', 
          quantity: item.quantity,
          note: `Pengembalian stok dari pesanan #${orderId} yang dibatalkan oleh pengguna.`,
        },
      });
    }

 
    const canceledOrder = await tx.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELED },
    });

  
    await tx.orderStatusLog.create({
      data: {
        orderId: orderId,
        previousStatus: order.status,
        newStatus: OrderStatus.CANCELED,
        changedById: userId, 
        note: 'Pesanan dibatalkan oleh pengguna.',
      },
    });

    return canceledOrder;
  });
};

export const confirmOrderReceived = async (userId: number, orderId: number) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: userId,
    },
  });

  if (!order) {
    throw new Error(`Pesanan dengan ID ${orderId} tidak ditemukan atau bukan milik Anda.`);
  }


  if (order.status !== 'SHIPPED') {
    throw new Error('Hanya pesanan dengan status "Dikirim" yang bisa dikonfirmasi.');
  }


  return prisma.$transaction(async (tx) => {
 
    const confirmedOrder = await tx.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CONFIRMED },
    });

    
    await tx.orderStatusLog.create({
      data: {
        orderId: orderId,
        previousStatus: OrderStatus.SHIPPED,
        newStatus: OrderStatus.CONFIRMED,
        changedById: userId, 
        note: 'Pesanan dikonfirmasi diterima oleh pengguna.',
      },
    });

    return confirmedOrder;
  });
};