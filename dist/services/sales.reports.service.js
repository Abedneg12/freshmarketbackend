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
exports.getMonthlySalesByProductReport = exports.getMonthlySalesByCategoryReport = exports.getMonthlySalesReport = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../lib/prisma"));
const access_util_1 = require("../utils/access.util");
const getMonthlySalesReport = (adminUser, year, storeId) => __awaiter(void 0, void 0, void 0, function* () {
    const accessibleStoreIds = yield (0, access_util_1.getAccessibleStoreIds)(adminUser, storeId);
    const whereClause = {
        createdAt: {
            gte: new Date(year, 0, 1),
            lt: new Date(year + 1, 0, 1),
        },
        status: {
            in: [client_1.OrderStatus.CONFIRMED, client_1.OrderStatus.SHIPPED, client_1.OrderStatus.PROCESSED],
        },
    };
    if (accessibleStoreIds) {
        whereClause.storeId = { in: accessibleStoreIds };
    }
    const salesData = yield prisma_1.default.order.groupBy({
        by: ['storeId'],
        where: whereClause,
        _sum: {
            totalPrice: true,
        },
        orderBy: {
            storeId: 'asc',
        },
    });
    const allOrders = yield prisma_1.default.order.findMany({
        where: whereClause,
        select: {
            createdAt: true,
            totalPrice: true,
            storeId: true,
            store: { select: { name: true } } // Include store name
        }
    });
    const monthlySalesMap = new Map();
    allOrders.forEach(order => {
        const monthYear = `${order.createdAt.getFullYear()}-${(order.createdAt.getMonth() + 1).toString().padStart(2, '0')}`;
        if (!monthlySalesMap.has(monthYear)) {
            monthlySalesMap.set(monthYear, { totalSales: 0, stores: {} });
        }
        const monthData = monthlySalesMap.get(monthYear);
        monthData.totalSales += order.totalPrice;
        if (!monthData.stores[order.storeId]) {
            monthData.stores[order.storeId] = { name: order.store.name, totalSales: 0 };
        }
        monthData.stores[order.storeId].totalSales += order.totalPrice;
    });
    const monthlySales = Array.from(monthlySalesMap.entries())
        .map(([monthYear, data]) => ({
        monthYear,
        totalSales: data.totalSales,
        stores: Object.values(data.stores),
    }))
        .sort((a, b) => a.monthYear.localeCompare(b.monthYear)); // Sort by month-year
    return monthlySales;
});
exports.getMonthlySalesReport = getMonthlySalesReport;
const getMonthlySalesByCategoryReport = (adminUser, year, storeId) => __awaiter(void 0, void 0, void 0, function* () {
    const accessibleStoreIds = yield (0, access_util_1.getAccessibleStoreIds)(adminUser, storeId);
    const whereClause = {
        createdAt: {
            gte: new Date(year, 0, 1),
            lt: new Date(year + 1, 0, 1),
        },
        status: {
            in: [client_1.OrderStatus.CONFIRMED, client_1.OrderStatus.SHIPPED, client_1.OrderStatus.PROCESSED],
        },
    };
    if (accessibleStoreIds) {
        whereClause.storeId = { in: accessibleStoreIds };
    }
    const orderItems = yield prisma_1.default.orderItem.findMany({
        where: {
            order: whereClause,
        },
        include: {
            product: {
                include: {
                    category: true,
                },
            },
            order: {
                select: {
                    createdAt: true,
                    storeId: true,
                    store: { select: { name: true } }
                }
            }
        },
    });
    const monthlyCategorySalesMap = new Map();
    orderItems.forEach(item => {
        const monthYear = `${item.order.createdAt.getFullYear()}-${(item.order.createdAt.getMonth() + 1).toString().padStart(2, '0')}`;
        const categoryName = item.product.category.name;
        const itemSales = item.quantity * item.price;
        if (!monthlyCategorySalesMap.has(monthYear)) {
            monthlyCategorySalesMap.set(monthYear, {});
        }
        const monthData = monthlyCategorySalesMap.get(monthYear);
        if (!monthData[categoryName]) {
            monthData[categoryName] = { totalSales: 0, quantitySold: 0 };
        }
        monthData[categoryName].totalSales += itemSales;
        monthData[categoryName].quantitySold += item.quantity;
    });
    const monthlyCategorySales = Array.from(monthlyCategorySalesMap.entries())
        .map(([monthYear, categoriesData]) => ({
        monthYear,
        categories: Object.entries(categoriesData).map(([name, data]) => ({
            name,
            totalSales: data.totalSales,
            quantitySold: data.quantitySold,
        })).sort((a, b) => b.totalSales - a.totalSales),
    }))
        .sort((a, b) => a.monthYear.localeCompare(b.monthYear));
    return monthlyCategorySales;
});
exports.getMonthlySalesByCategoryReport = getMonthlySalesByCategoryReport;
const getMonthlySalesByProductReport = (adminUser, year, storeId) => __awaiter(void 0, void 0, void 0, function* () {
    const accessibleStoreIds = yield (0, access_util_1.getAccessibleStoreIds)(adminUser, storeId);
    const whereClause = {
        createdAt: {
            gte: new Date(year, 0, 1),
            lt: new Date(year + 1, 0, 1),
        },
        status: {
            in: [client_1.OrderStatus.CONFIRMED, client_1.OrderStatus.SHIPPED, client_1.OrderStatus.PROCESSED],
        },
    };
    if (accessibleStoreIds) {
        whereClause.storeId = { in: accessibleStoreIds };
    }
    const orderItems = yield prisma_1.default.orderItem.findMany({
        where: {
            order: whereClause,
        },
        include: {
            product: {
                select: {
                    id: true,
                    name: true,
                },
            },
            order: {
                select: {
                    createdAt: true,
                    storeId: true,
                    store: { select: { name: true } }
                }
            }
        },
    });
    const monthlyProductSalesMap = new Map();
    orderItems.forEach(item => {
        const monthYear = `${item.order.createdAt.getFullYear()}-${(item.order.createdAt.getMonth() + 1).toString().padStart(2, '0')}`;
        const productName = item.product.name;
        const itemSales = item.quantity * item.price;
        if (!monthlyProductSalesMap.has(monthYear)) {
            monthlyProductSalesMap.set(monthYear, {});
        }
        const monthData = monthlyProductSalesMap.get(monthYear);
        if (!monthData[productName]) {
            monthData[productName] = { totalSales: 0, quantitySold: 0 };
        }
        monthData[productName].totalSales += itemSales;
        monthData[productName].quantitySold += item.quantity;
    });
    const monthlyProductSales = Array.from(monthlyProductSalesMap.entries())
        .map(([monthYear, productsData]) => ({
        monthYear,
        products: Object.entries(productsData).map(([name, data]) => ({
            name,
            totalSales: data.totalSales,
            quantitySold: data.quantitySold,
        })).sort((a, b) => b.totalSales - a.totalSales),
    }))
        .sort((a, b) => a.monthYear.localeCompare(b.monthYear));
    return monthlyProductSales;
});
exports.getMonthlySalesByProductReport = getMonthlySalesByProductReport;
