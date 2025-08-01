import { Request, Response } from 'express';
import { getMonthlySalesReport, getMonthlySalesByCategoryReport, getMonthlySalesByProductReport } from '../services/sales.reports.service';

export const getMonthlySalesReportController = async (req: Request, res: Response): Promise<void> => {
    const adminUser = req.user;
    if (!adminUser) {
        res.status(401).json({ message: 'Unauthorized: Admin not found' });
        return;
    }

    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
    const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : undefined;

    try {
        const report = await getMonthlySalesReport(adminUser, year, storeId);
        res.status(200).json(report);
    } catch (error: any) {
        console.error("Error fetching monthly sales report:", error);
        if (error.message.includes('Forbidden')) {
            res.status(403).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Gagal mengambil laporan penjualan bulanan', error: error.message });
        }
    }
};

export const getMonthlySalesByCategoryReportController = async (req: Request, res: Response): Promise<void> => {
    const adminUser = req.user;
    if (!adminUser) {
        res.status(401).json({ message: 'Unauthorized: Admin not found' });
        return;
    }

    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
    const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : undefined;

    try {
        const report = await getMonthlySalesByCategoryReport(adminUser, year, storeId);
        res.status(200).json(report);
    } catch (error: any) {
        console.error("Error fetching monthly sales by category report:", error);
        if (error.message.includes('Forbidden')) {
            res.status(403).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Gagal mengambil laporan penjualan bulanan berdasarkan kategori', error: error.message });
        }
    }
};

export const getMonthlySalesByProductReportController = async (req: Request, res: Response): Promise<void> => {
    const adminUser = req.user;
    if (!adminUser) {
        res.status(401).json({ message: 'Unauthorized: Admin not found' });
        return;
    }

    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
    const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : undefined;

    try {
        const report = await getMonthlySalesByProductReport(adminUser, year, storeId);
        res.status(200).json(report);
    } catch (error: any) {
        console.error("Error fetching monthly sales by product report:", error);
        if (error.message.includes('Forbidden')) {
            res.status(403).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Gagal mengambil laporan penjualan bulanan berdasarkan produk', error: error.message });
        }
    }
};