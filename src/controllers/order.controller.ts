import { Request, Response, NextFunction } from 'express';
import * as orderService from '../services/order.service';
import { cloudinaryUpload } from '../utils/cloudinary';
/**
 * Controller untuk membuat pesanan baru dari checkout.
 */
export const createOrderController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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

    const result = await orderService.checkout(
      req.user.id,
      Number(addressId),
      paymentMethod,
      voucherCode,
      cartItemIds
    );

    res.status(201).json({
      message: 'Pesanan berhasil dibuat',
      data: result, // result sudah berisi { order, midtransRedirectUrl? }
    });
  } catch (error) {
    console.error('[Create Order Error]', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat membuat pesanan',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Controller untuk mengambil riwayat pesanan milik pengguna yang sedang login.
 */
export const getUserOrdersController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { status, orderId, startDate, endDate, page, limit, sortBy, sortOrder } = req.query;

    const result = await orderService.getUserOrdersService(req.user.id, {
      status: status as string,
      orderId: orderId ? Number(orderId) : undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      sortBy: (sortBy as string) || 'createdAt',
      sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
    });

    res.status(200).json({
      message: 'Berhasil mengambil daftar pesanan',
      ...result,
    });
  } catch (error) {
    console.error('[Get Orders Error]', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil pesanan',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Controller untuk menangani upload bukti pembayaran manual.
 */
export const uploadPaymentProofController = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = Number(req.params.orderId);
    const userId = req.user!.id;

    if (!req.file) {
      res.status(400).json({ message: 'File bukti pembayaran wajib diunggah.' });
      return;
    }

    const result = await cloudinaryUpload(req.file);
    const imageUrl = result.secure_url;

    const order = await orderService.submitPaymentProof(orderId, userId, imageUrl);

    res.status(200).json({ 
      message: 'Bukti pembayaran berhasil diunggah. Menunggu konfirmasi admin.',
      data: order 
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// --- FUNGSI BARU ---
/**
 * Controller untuk menangani notifikasi webhook dari Midtrans.
 * Menerima body notifikasi dan memanggil service untuk diproses.
 */
export const handleMidtransNotificationController = async (req: Request, res: Response) => {
  try {
    await orderService.handleMidtransNotification(req.body);
    // Beri respons 200 OK agar Midtrans tahu notifikasi sudah diterima.
    res.status(200).json({ message: 'Notification received successfully.' });
  } catch (error: any) {
    console.error('[Midtrans Notification Error]', error);
    // Jika ada error, Midtrans akan mencoba mengirim notifikasi lagi nanti.
    res.status(500).json({ message: error.message });
  }
};