// src/cron/scheduler.ts -> VERSI LENGKAP & FINAL

import cron from 'node-cron';
// --- 1. Impor fungsi service baru ---
import { 
  cancelExpiredOrders, 
  autoConfirmShippedOrders 
} from '../services/admin/order.admin.service';

/**
 * Fungsi untuk menginisialisasi semua tugas terjadwal (cron jobs)
 * yang ada di aplikasi.
 */
export const initScheduledJobs = () => {
  // =======================================================================
  // JADWAL 1: Membatalkan Pesanan Kedaluwarsa (setiap 5 menit)
  // =======================================================================
  const cancelJob = cron.schedule('*/5 * * * *', async () => {
    console.log('---------------------');
    console.log('Running Scheduled Job: Cancel Expired Orders');
    await cancelExpiredOrders();
    console.log('Finished Scheduled Job: Cancel Expired Orders');
    console.log('---------------------');
  });
  
  // =======================================================================
  // JADWAL 2: Konfirmasi Otomatis Pesanan Terkirim (setiap hari jam 2 pagi)
  // =======================================================================
  // Format '0 2 * * *' berarti "pada menit ke-0, jam ke-2, setiap hari".
  // Jadwal ini cocok untuk tugas yang tidak perlu dijalankan terlalu sering.
  const confirmJob = cron.schedule('0 2 * * *', async () => {
    console.log('---------------------');
    console.log('Running Scheduled Job: Auto-Confirm Shipped Orders');
    await autoConfirmShippedOrders();
    console.log('Finished Scheduled Job: Auto-Confirm Shipped Orders');
    console.log('---------------------');
  });

  // Mulai semua tugas terjadwal
  cancelJob.start();
  confirmJob.start();

  console.log('All scheduled jobs have been initialized.');
};