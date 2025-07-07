// src/services/admin/order.admin.service.ts -> VERSI LENGKAP

import { OrderStatus, Prisma, UserRole } from '@prisma/client';
import { IUserPayload } from '../../interfaces/IUserPayload';
import prisma from '../../lib/prisma';
import { IAdminOrderFilter, TPaymentDecision } from '../../interfaces/admin.interface';
import { sendOrderStatusEmail } from '../../utils/emailorderstatus';


export const getOrdersForAdmin = async (adminUser: IUserPayload, filter: IAdminOrderFilter) => {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', status, storeId, orderId } = filter;
  const whereClause: Prisma.OrderWhereInput = {};
  if (adminUser.role === 'STORE_ADMIN') {
      const assignments = await prisma.storeAdminAssignment.findMany({ where: { userId: adminUser.id }, select: { storeId: true } });
      const assignedStoreIds = assignments.map(a => a.storeId);
      if (assignedStoreIds.length === 0) {
          return { data: [], pagination: { total: 0, page, limit, totalPages: 0 } };
      }
      whereClause.storeId = { in: assignedStoreIds };
  } else if (adminUser.role === 'SUPER_ADMIN') {
      if (storeId) {
          whereClause.storeId = storeId;
      }
  }
  if (status && Object.values(OrderStatus).includes(status)) {
      whereClause.status = status;
  }
  if (orderId) {
      whereClause.id = orderId;
  }
  const totalOrders = await prisma.order.count({ where: whereClause });
  const orders = await prisma.order.findMany({
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
};


// SERVICE UNTUK KONFIRMASI PEMBAYARAN
export const confirmPayment = async (adminUser: IUserPayload, orderId: number, decision: TPaymentDecision) => {
  // Logika validasi pesanan tetap sama
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) { throw new Error(`Pesanan dengan ID ${orderId} tidak ditemukan.`); }
  if (order.status !== 'WAITING_CONFIRMATION') { throw new Error('Hanya pesanan dengan status "Menunggu Konfirmasi" yang bisa diproses.'); }
  if (adminUser.role === 'STORE_ADMIN') {
      const assignment = await prisma.storeAdminAssignment.findFirst({ where: { userId: adminUser.id, storeId: order.storeId } });
      if (!assignment) { throw new Error('Forbidden: Anda tidak memiliki akses untuk mengelola pesanan ini.'); }
  }

  const newStatus = decision === 'APPROVE' ? OrderStatus.PROCESSED : OrderStatus.WAITING_FOR_PAYMENT;
  const note = decision === 'APPROVE' ? 'Pembayaran telah dikonfirmasi oleh admin.' : 'Pembayaran ditolak oleh admin. Menunggu bukti pembayaran baru dari user.';

  // Logika transaksi database tetap sama
  const updatedOrder = await prisma.$transaction(async (tx) => {
      const updatedOrderData = await tx.order.update({ where: { id: orderId }, data: { status: newStatus } });
      await tx.orderStatusLog.create({
          data: {
              orderId,
              previousStatus: OrderStatus.WAITING_CONFIRMATION,
              newStatus: newStatus,
              changedById: adminUser.id,
              note: note,
          },
      });
      return updatedOrderData;
  });

  // --- 2. Tambahkan logika pengiriman email di sini ---
  const user = await prisma.user.findUnique({ where: { id: order.userId } });
  if (user) {
      const FE_ORDER_URL = `${process.env.FE_PORT}/orders/${order.id}`;

      if (decision === 'APPROVE') {
          await sendOrderStatusEmail(
              user.email,
              `Pembayaran untuk Pesanan #${order.id} Dikonfirmasi`,
              {
                  name: user.fullName,
                  orderId: order.id,
                  status: 'Pembayaran Dikonfirmasi',
                  message: 'Terima kasih! Pembayaran Anda telah kami terima dan pesanan Anda sedang kami siapkan untuk pengiriman.',
                  orderUrl: FE_ORDER_URL,
              },
              'orderStatusNotification'
          );
      } else { // Jika 'REJECT'
          await sendOrderStatusEmail(
              user.email,
              `Pembayaran untuk Pesanan #${order.id} Ditolak`,
              {
                  name: user.fullName,
                  orderId: order.id,
                  status: 'Pembayaran Ditolak',
                  message: 'Mohon maaf, bukti pembayaran yang Anda unggah tidak dapat kami verifikasi. Silakan unggah kembali bukti pembayaran yang valid di halaman detail pesanan.',
                  orderUrl: FE_ORDER_URL,
              },
              'orderStatusNotification'
          );
      }
  }

  return updatedOrder;
};


// SERVICE UNTUK MENGIRIM PESANAN (BARU)
export const shipOrder = async (adminUser: IUserPayload, orderId: number) => {
    // Logika validasi dan transaksi database tetap sama
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) { throw new Error(`Pesanan dengan ID ${orderId} tidak ditemukan.`); }
    if (order.status !== 'PROCESSED') { throw new Error('Hanya pesanan dengan status "Diproses" yang bisa dikirim.'); }
    if (adminUser.role === 'STORE_ADMIN') {
        const assignment = await prisma.storeAdminAssignment.findFirst({ where: { userId: adminUser.id, storeId: order.storeId } });
        if (!assignment) { throw new Error('Forbidden: Anda tidak memiliki akses untuk mengelola pesanan ini.'); }
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
        const updatedOrderData = await tx.order.update({ where: { id: orderId }, data: { status: OrderStatus.SHIPPED } });
        await tx.orderStatusLog.create({
            data: {
                orderId,
                previousStatus: OrderStatus.PROCESSED,
                newStatus: OrderStatus.SHIPPED,
                changedById: adminUser.id,
                note: 'Pesanan telah dikirim oleh admin.',
            },
        });
        return updatedOrderData;
    });

    // --- 3. Tambahkan logika pengiriman email di sini ---
    const user = await prisma.user.findUnique({ where: { id: order.userId } });
    if (user) {
        const FE_ORDER_URL = `${process.env.FE_PORT}/orders/${order.id}`;
        await sendOrderStatusEmail(
            user.email,
            `Pesanan #${order.id} Telah Dikirim!`,
            {
                name: user.fullName,
                orderId: order.id,
                status: 'Pesanan Dikirim',
                message: 'Pesanan Anda sedang dalam perjalanan menuju alamat tujuan. Mohon konfirmasi jika pesanan sudah Anda terima melalui halaman detail pesanan.',
                orderUrl: FE_ORDER_URL,
            },
            'orderStatusNotification'
        );
    }
  
    return updatedOrder;
};


export const cancelOrder = async (adminUser: IUserPayload, orderId: number) => {
  // Langkah 1: Cari pesanan beserta item-itemnya.
  const order = await prisma.order.findUnique({
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
    const assignment = await prisma.storeAdminAssignment.findFirst({
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
  return prisma.$transaction(async (tx) => {
    // a. Kembalikan stok untuk setiap item dalam pesanan.
    for (const item of order.items) {
      // Tambah kembali stok di gudang yang bersangkutan
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

      // b. Buat jurnal inventaris untuk mencatat pengembalian stok.
      await tx.inventoryJournal.create({
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
    const canceledOrder = await tx.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELED },
    });

    // d. Catat histori perubahan status.
    await tx.orderStatusLog.create({
      data: {
        orderId: orderId,
        previousStatus: order.status,
        newStatus: OrderStatus.CANCELED,
        changedById: adminUser.id,
        note: 'Pesanan dibatalkan oleh admin.',
      },
    });

    return canceledOrder;
  });
};

export const cancelExpiredOrders = async () => {
  console.log('Running cron job: Checking for expired orders...');
  
  // Tentukan waktu batas (1 jam yang lalu dari sekarang)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  // 1. Cari semua pesanan yang berpotensi kedaluwarsa
  const expiredOrders = await prisma.order.findMany({
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
      await prisma.$transaction(async (tx) => {
        // a. Kembalikan stok untuk setiap item
        for (const item of order.items) {
          await tx.stock.updateMany({
            where: {
              storeId: order.storeId,
              productId: item.productId,
            },
            data: {
              quantity: { increment: item.quantity },
            },
          });
          // b. Buat jurnal inventaris
          await tx.inventoryJournal.create({
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
        await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.CANCELED },
        });
        // d. Catat histori perubahan status
        await tx.orderStatusLog.create({
          data: {
            orderId: order.id,
            previousStatus: order.status,
            newStatus: OrderStatus.CANCELED,
            changedById: null, // Dibatalkan oleh sistem
            note: 'Pesanan dibatalkan otomatis oleh sistem karena melewati batas waktu pembayaran.',
          },
        });
      });
      console.log(`Order #${order.id} has been canceled successfully.`);
    } catch (error) {
      console.error(`Failed to cancel order #${order.id}:`, error);
    }
  }
};

export const autoConfirmShippedOrders = async () => {
  console.log('Running cron job: Checking for auto-confirmable orders...');

  // Tentukan waktu batas (7 hari yang lalu dari sekarang)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // 1. Cari semua pesanan yang statusnya masih SHIPPED.
  const shippedOrders = await prisma.order.findMany({
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
      await prisma.$transaction(async (tx) => {
        // a. Ubah status pesanan menjadi CONFIRMED
        await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.CONFIRMED },
        });
        // b. Catat histori perubahan status
        await tx.orderStatusLog.create({
          data: {
            orderId: order.id,
            previousStatus: OrderStatus.SHIPPED,
            newStatus: OrderStatus.CONFIRMED,
            changedById: null, // Dikonfirmasi oleh sistem
            note: 'Pesanan dikonfirmasi otomatis oleh sistem setelah 7 hari.',
          },
        });
      });
      console.log(`Order #${order.id} has been auto-confirmed successfully.`);
    } catch (error) {
      console.error(`Failed to auto-confirm order #${order.id}:`, error);
    }
  }
};