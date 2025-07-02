// src/services/admin/order.admin.service.ts -> VERSI LENGKAP

import { OrderStatus, Prisma, UserRole } from '@prisma/client';
import { IUserPayload } from '../../interfaces/IUserPayload';
import prisma from '../../lib/prisma';
import { IAdminOrderFilter, TPaymentDecision } from '../../interfaces/admin.interface';



// SERVICE UNTUK MELIHAT DAFTAR PESANAN
export const getOrdersForAdmin = async (
  adminUser: IUserPayload,
  filter: IAdminOrderFilter
) => {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', status, storeId, orderId } = filter;
  const whereClause: Prisma.OrderWhereInput = {};

  if (adminUser.role === 'STORE_ADMIN') {
    const assignments = await prisma.storeAdminAssignment.findMany({
      where: { userId: adminUser.id },
      select: { storeId: true },
    });
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

  return {
    data: orders,
    pagination: {
      total: totalOrders,
      page,
      limit,
      totalPages: Math.ceil(totalOrders / limit),
    },
  };
};


// SERVICE UNTUK KONFIRMASI PEMBAYARAN
export const confirmPayment = async (
  adminUser: IUserPayload,
  orderId: number,
  decision: TPaymentDecision,
) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new Error(`Pesanan dengan ID ${orderId} tidak ditemukan.`);
  }
  if (order.status !== 'WAITING_CONFIRMATION') {
    throw new Error('Hanya pesanan dengan status "Menunggu Konfirmasi" yang bisa diproses.');
  }
  if (adminUser.role === 'STORE_ADMIN') {
    const assignment = await prisma.storeAdminAssignment.findFirst({ where: { userId: adminUser.id, storeId: order.storeId } });
    if (!assignment) {
      throw new Error('Forbidden: Anda tidak memiliki akses untuk mengelola pesanan ini.');
    }
  }

  const newStatus = decision === 'APPROVE' ? OrderStatus.PROCESSED : OrderStatus.WAITING_FOR_PAYMENT;
  const note = decision === 'APPROVE' ? 'Pembayaran telah dikonfirmasi oleh admin.' : 'Pembayaran ditolak oleh admin. Menunggu bukti pembayaran baru dari user.';

  const updatedOrder = await prisma.$transaction(async (tx) => {
    const updatedOrderData = await tx.order.update({ where: { id: orderId }, data: { status: newStatus } });
    await tx.orderStatusLog.create({
      data: {
        orderId: orderId,
        previousStatus: OrderStatus.WAITING_CONFIRMATION,
        newStatus: newStatus,
        changedById: adminUser.id,
        note: note,
      },
    });
    return updatedOrderData;
  });

  // TODO: Kirim notifikasi email ke user tentang status pembayarannya.
  return updatedOrder;
};


// SERVICE UNTUK MENGIRIM PESANAN (BARU)
export const shipOrder = async (adminUser: IUserPayload, orderId: number) => {
  // Langkah 1: Cari pesanan yang akan diproses.
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error(`Pesanan dengan ID ${orderId} tidak ditemukan.`);
  }

  // Langkah 2: Pastikan status pesanan adalah PROCESSED.
  if (order.status !== 'PROCESSED') {
    throw new Error('Hanya pesanan dengan status "Diproses" yang bisa dikirim.');
  }

  // Langkah 3: Jika yang login adalah Store Admin, pastikan dia berhak atas pesanan ini.
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

  // Langkah 4: Update database dalam satu transaksi.
  const updatedOrder = await prisma.$transaction(async (tx) => {
    // a. Update status pesanan menjadi SHIPPED
    const updatedOrderData = await tx.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.SHIPPED },
    });

    // b. Catat aksi admin di log
    await tx.orderStatusLog.create({
      data: {
        orderId: orderId,
        previousStatus: OrderStatus.PROCESSED,
        newStatus: OrderStatus.SHIPPED,
        changedById: adminUser.id,
        note: 'Pesanan telah dikirim oleh admin.',
      },
    });

    return updatedOrderData;
  });

  // TODO: Kirim notifikasi email ke user bahwa pesanannya sudah dikirim, kita pakai nodemailer.
  
  return updatedOrder;
};