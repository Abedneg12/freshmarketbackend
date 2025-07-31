// src/controllers/admin/dashboard.admin.controller.ts
import { Request, Response } from 'express';
import { getDashboardSummary, getRecentActivity } from '../../services/admin/storeadmindashboard.service';

export const getDashboardSummaryController = async (req: Request, res: Response) => {
    try {
        const summary = await getDashboardSummary(req.user!);
        res.status(200).json({ data: summary });
    } catch (error: any) {
        res.status(500).json({ message: 'Gagal mengambil data ringkasan dasbor', error: error.message });
    }
};

export const getRecentActivityController = async (req: Request, res: Response) => {
    try {
        const activity = await getRecentActivity(req.user!);
        res.status(200).json({ data: activity });
    } catch (error: any) {
        res.status(500).json({ message: 'Gagal mengambil data aktivitas terbaru', error: error.message });
    }
};