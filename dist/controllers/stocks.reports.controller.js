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
exports.getMonthlyStockDetailReportController = exports.getMonthlyStockSummaryReportController = void 0;
const stock_reports_service_1 = require("../services/stock.reports.service");
const getMonthlyStockSummaryReportController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const adminUser = req.user;
    if (!adminUser) {
        res.status(401).json({ message: 'Unauthorized: Admin not found' });
        return;
    }
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
    const month = req.query.month ? parseInt(req.query.month) : new Date().getMonth() + 1;
    const storeId = req.query.storeId ? parseInt(req.query.storeId) : undefined;
    try {
        const report = yield (0, stock_reports_service_1.getMonthlyStockSummaryReport)(adminUser, year, month, storeId);
        res.status(200).json(report);
    }
    catch (error) {
        console.error("Error fetching monthly stock summary report:", error);
        if (error.message.includes('Forbidden')) {
            res.status(403).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'Gagal mengambil laporan ringkasan stok bulanan', error: error.message });
        }
    }
});
exports.getMonthlyStockSummaryReportController = getMonthlyStockSummaryReportController;
const getMonthlyStockDetailReportController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const adminUser = req.user;
    if (!adminUser) {
        res.status(401).json({ message: 'Unauthorized: Admin not found' });
        return;
    }
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
    const month = req.query.month ? parseInt(req.query.month) : new Date().getMonth() + 1;
    const productId = req.query.productId ? parseInt(req.query.productId) : undefined;
    const storeId = req.query.storeId ? parseInt(req.query.storeId) : undefined;
    if (!productId) {
        res.status(400).json({ message: 'productId is required' });
        return;
    }
    try {
        const report = yield (0, stock_reports_service_1.getMonthlyStockDetailReport)(adminUser, year, month, productId, storeId);
        res.status(200).json(report);
    }
    catch (error) {
        console.error("Error fetching monthly stock detail report:", error);
        if (error.message.includes('Forbidden')) {
            res.status(403).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'Gagal mengambil laporan detail stok bulanan', error: error.message });
        }
    }
});
exports.getMonthlyStockDetailReportController = getMonthlyStockDetailReportController;
