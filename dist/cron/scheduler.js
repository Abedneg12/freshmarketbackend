"use strict";
// src/cron/scheduler.ts -> VERSI LENGKAP & FINAL
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
exports.initScheduledJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
// --- 1. Impor fungsi service baru ---
const order_admin_service_1 = require("../services/admin/order.admin.service");
/**
 * Fungsi untuk menginisialisasi semua tugas terjadwal (cron jobs)
 * yang ada di aplikasi.
 */
const initScheduledJobs = () => {
    // =======================================================================
    // JADWAL 1: Membatalkan Pesanan Kedaluwarsa (setiap 5 menit)
    // =======================================================================
    const cancelJob = node_cron_1.default.schedule('*/5 * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
        console.log('---------------------');
        console.log('Running Scheduled Job: Cancel Expired Orders');
        yield (0, order_admin_service_1.cancelExpiredOrders)();
        console.log('Finished Scheduled Job: Cancel Expired Orders');
        console.log('---------------------');
    }));
    // =======================================================================
    // JADWAL 2: Konfirmasi Otomatis Pesanan Terkirim (setiap hari jam 2 pagi)
    // =======================================================================
    // Format '0 2 * * *' berarti "pada menit ke-0, jam ke-2, setiap hari".
    // Jadwal ini cocok untuk tugas yang tidak perlu dijalankan terlalu sering.
    const confirmJob = node_cron_1.default.schedule('0 2 * * *', () => __awaiter(void 0, void 0, void 0, function* () {
        console.log('---------------------');
        console.log('Running Scheduled Job: Auto-Confirm Shipped Orders');
        yield (0, order_admin_service_1.autoConfirmShippedOrders)();
        console.log('Finished Scheduled Job: Auto-Confirm Shipped Orders');
        console.log('---------------------');
    }));
    // Mulai semua tugas terjadwal
    cancelJob.start();
    confirmJob.start();
    console.log('All scheduled jobs have been initialized.');
};
exports.initScheduledJobs = initScheduledJobs;
