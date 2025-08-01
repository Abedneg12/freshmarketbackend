import { Request, Response } from 'express';
import { getMonthlyStockSummaryReport, getMonthlyStockDetailReport } from '../services/stock.reports.service';

export const getMonthlyStockSummaryReportController = async (req: Request, res: Response): Promise<void> => {
    const adminUser = req.user;
    if (!adminUser) {
        res.status(401).json({ message: 'Unauthorized: Admin not found' });
        return;
    }
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
    const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth() + 1;
    const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : undefined;
    try {
        const report = await getMonthlyStockSummaryReport(adminUser, year, month, storeId);
        res.status(200).json(report);
    } catch (error: any) {
        console.error("Error fetching monthly stock summary report:", error);
        if (error.message.includes('Forbidden')) {
            res.status(403).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Gagal mengambil laporan ringkasan stok bulanan', error: error.message });
        }
    }
};

export const getMonthlyStockDetailReportController = async (req: Request, res: Response): Promise<void> => {
    const adminUser = req.user;
    if (!adminUser) {
        res.status(401).json({ message: 'Unauthorized: Admin not found' });
        return;
    }
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
    const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth() + 1;
    const productId = req.query.productId ? parseInt(req.query.productId as string) : undefined;
    const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : undefined;
    if (!productId) {
        res.status(400).json({ message: 'productId is required' });
        return;
    }
    try {
        const report = await getMonthlyStockDetailReport(adminUser, year, month, productId, storeId);
        res.status(200).json(report);
    } catch (error: any) {
        console.error("Error fetching monthly stock detail report:", error);
        if (error.message.includes('Forbidden')) {
            res.status(403).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Gagal mengambil laporan detail stok bulanan', error: error.message });
        }
    }
};