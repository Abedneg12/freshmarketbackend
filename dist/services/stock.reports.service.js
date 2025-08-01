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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonthlyStockDetailReport = exports.getMonthlyStockSummaryReport = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const access_util_1 = require("../utils/access.util");
const getMonthlyStockSummaryReport = (adminUser, year, month, // 1-12
storeId) => __awaiter(void 0, void 0, void 0, function* () {
    const accessibleStoreIds = yield (0, access_util_1.getAccessibleStoreIds)(adminUser, storeId);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    // Fetch all inventory journals up to the end of the requested month
    const allMovements = yield prisma_1.default.inventoryJournal.findMany({
        where: {
            createdAt: {
                lte: endDate,
            },
            storeId: {
                in: accessibleStoreIds,
            },
        },
        select: {
            productId: true,
            quantity: true,
            type: true,
            createdAt: true,
            product: {
                select: {
                    name: true,
                },
            },
        },
        orderBy: {
            createdAt: 'asc',
        },
    });
    const reportMap = new Map();
    for (const movement of allMovements) {
        if (!reportMap.has(movement.productId)) {
            reportMap.set(movement.productId, {
                productName: movement.product.name,
                beginningStock: 0,
                totalAdditions: 0,
                totalSubtractions: 0,
                endingStock: 0,
            });
        }
        const entry = reportMap.get(movement.productId);
        const change = movement.type === 'IN' ? movement.quantity : -movement.quantity;
        // If movement is before the start of the month, it contributes to beginning stock
        if (movement.createdAt < startDate) {
            entry.beginningStock += change;
        }
        else {
            // Movement is within the month
            if (change > 0) {
                entry.totalAdditions += change;
            }
            else {
                entry.totalSubtractions += Math.abs(change);
            }
        }
    }
    // Calculate final ending stock after processing all movements
    for (const entry of reportMap.values()) {
        entry.endingStock =
            entry.beginningStock + entry.totalAdditions - entry.totalSubtractions;
    }
    return Array.from(reportMap.values())
        .filter((r) => r.endingStock !== 0 || r.totalAdditions !== 0 || r.totalSubtractions !== 0)
        .sort((a, b) => a.productName.localeCompare(b.productName));
});
exports.getMonthlyStockSummaryReport = getMonthlyStockSummaryReport;
const getMonthlyStockDetailReport = (adminUser, year, month, productId, storeId) => __awaiter(void 0, void 0, void 0, function* () {
    const accessibleStoreIds = yield (0, access_util_1.getAccessibleStoreIds)(adminUser, storeId);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    // 1. Get all changes before the start of the month to calculate starting stock
    const priorMovements = yield prisma_1.default.inventoryJournal.findMany({
        where: {
            productId: productId,
            createdAt: { lt: startDate },
            storeId: { in: accessibleStoreIds },
        },
        select: { quantity: true, type: true },
    });
    const startingStock = priorMovements.reduce((sum, movement) => {
        return sum + (movement.type === 'IN' ? movement.quantity : -movement.quantity);
    }, 0);
    // 2. Get all movements within the month
    const movements = yield prisma_1.default.inventoryJournal.findMany({
        where: {
            productId: productId,
            createdAt: { gte: startDate, lte: endDate },
            storeId: { in: accessibleStoreIds },
        },
        include: {
            store: { select: { name: true } },
        },
        orderBy: { createdAt: 'asc' },
    });
    return { startingStock, movements };
});
exports.getMonthlyStockDetailReport = getMonthlyStockDetailReport;
