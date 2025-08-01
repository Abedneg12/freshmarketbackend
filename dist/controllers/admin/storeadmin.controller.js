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
exports.getRecentActivityController = exports.getDashboardSummaryController = void 0;
const storeadmindashboard_service_1 = require("../../services/admin/storeadmindashboard.service");
const getDashboardSummaryController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const summary = yield (0, storeadmindashboard_service_1.getDashboardSummary)(req.user);
        res.status(200).json({ data: summary });
    }
    catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data ringkasan dasbor', error: error.message });
    }
});
exports.getDashboardSummaryController = getDashboardSummaryController;
const getRecentActivityController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const activity = yield (0, storeadmindashboard_service_1.getRecentActivity)(req.user);
        res.status(200).json({ data: activity });
    }
    catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data aktivitas terbaru', error: error.message });
    }
});
exports.getRecentActivityController = getRecentActivityController;
