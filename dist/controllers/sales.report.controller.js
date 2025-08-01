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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonthlySalesByProductReportController = exports.getMonthlySalesByCategoryReportController = exports.getMonthlySalesReportController = void 0;
const sales_reports_service_1 = require("../services/sales.reports.service");
const getMonthlySalesReportController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const adminUser = req.user;
    if (!adminUser) {
        res.status(401).json({ message: 'Unauthorized: Admin not found' });
        return;
    }
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
    const storeId = req.query.storeId ? parseInt(req.query.storeId) : undefined;
    try {
        const report = yield (0, sales_reports_service_1.getMonthlySalesReport)(adminUser, year, storeId);
        res.status(200).json(report);
    }
    catch (error) {
        console.error("Error fetching monthly sales report:", error);
        if (error.message.includes('Forbidden')) {
            res.status(403).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'Gagal mengambil laporan penjualan bulanan', error: error.message });
        }
    }
});
exports.getMonthlySalesReportController = getMonthlySalesReportController;
const getMonthlySalesByCategoryReportController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const adminUser = req.user;
    if (!adminUser) {
        res.status(401).json({ message: 'Unauthorized: Admin not found' });
        return;
    }
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
    const storeId = req.query.storeId ? parseInt(req.query.storeId) : undefined;
    try {
        const report = yield (0, sales_reports_service_1.getMonthlySalesByCategoryReport)(adminUser, year, storeId);
        res.status(200).json(report);
    }
    catch (error) {
        console.error("Error fetching monthly sales by category report:", error);
        if (error.message.includes('Forbidden')) {
            res.status(403).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'Gagal mengambil laporan penjualan bulanan berdasarkan kategori', error: error.message });
        }
    }
});
exports.getMonthlySalesByCategoryReportController = getMonthlySalesByCategoryReportController;
const getMonthlySalesByProductReportController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const adminUser = req.user;
    if (!adminUser) {
        res.status(401).json({ message: 'Unauthorized: Admin not found' });
        return;
    }
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
    const storeId = req.query.storeId ? parseInt(req.query.storeId) : undefined;
    try {
        const report = yield (0, sales_reports_service_1.getMonthlySalesByProductReport)(adminUser, year, storeId);
        res.status(200).json(report);
    }
    catch (error) {
        console.error("Error fetching monthly sales by product report:", error);
        if (error.message.includes('Forbidden')) {
            res.status(403).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'Gagal mengambil laporan penjualan bulanan berdasarkan produk', error: error.message });
        }
    }
});
exports.getMonthlySalesByProductReportController = getMonthlySalesByProductReportController;
