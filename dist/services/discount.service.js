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
exports.getDiscountByStoreId = exports.updateDiscountService = exports.deleteDiscountService = exports.getAllDiscountsService = exports.createDiscountService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const access_util_1 = require("../utils/access.util");
const createDiscountService = (discount, adminUser) => __awaiter(void 0, void 0, void 0, function* () {
    const { type, productId, value, minPurchase, maxDiscount, startDate, endDate } = discount;
    const assignments = yield prisma_1.default.storeAdminAssignment.findMany({
        where: { userId: adminUser.id },
        select: { storeId: true },
    });
    const assignedStoreIds = assignments.map(a => a.storeId);
    const storeId = assignedStoreIds[0];
    // Validation logic
    if (type === "BUY1GET1") {
        if (!productId)
            throw new Error("BOGO discount requires productId.");
    }
    else if (type === "NOMINAL" || type === "PERCENTAGE") {
        if (!productId && !minPurchase) {
            throw new Error("minPurchase is required for cart-wide discount.");
        }
        if (type === "PERCENTAGE" && maxDiscount !== undefined && isNaN(Number(maxDiscount))) {
            throw new Error("maxDiscount must be a number for percentage discount.");
        }
        if (value === undefined || isNaN(Number(value))) {
            throw new Error("value must be a number for nominal/percentage discount.");
        }
    }
    else {
        throw new Error("Invalid discount type.");
    }
    // Check for existing discount
    const existingDiscount = yield prisma_1.default.discount.findFirst({
        where: { productId, storeId, type }
    });
    if (existingDiscount) {
        throw new Error(`A ${type} discount already exists for this product/store.`);
    }
    // Build data object
    const data = {
        productId,
        storeId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        type,
    };
    if (type === "NOMINAL" || type === "PERCENTAGE") {
        data.value = Number(value);
        if (minPurchase)
            data.minPurchase = minPurchase;
        if (type === "PERCENTAGE" && maxDiscount !== undefined) {
            data.maxDiscount = maxDiscount;
        }
    }
    return yield prisma_1.default.discount.create({ data });
});
exports.createDiscountService = createDiscountService;
const getAllDiscountsService = (adminUser) => __awaiter(void 0, void 0, void 0, function* () {
    const accessibleStoreIds = yield (0, access_util_1.getAccessibleStoreIds)(adminUser);
    return yield prisma_1.default.discount.findMany({
        where: { storeId: { in: accessibleStoreIds } },
        include: {
            product: true,
        },
    });
});
exports.getAllDiscountsService = getAllDiscountsService;
const deleteDiscountService = (discountId) => __awaiter(void 0, void 0, void 0, function* () {
    const discount = yield prisma_1.default.discount.findUnique({
        where: { id: discountId },
    });
    if (!discount) {
        throw new Error("Discount not found");
    }
    return yield prisma_1.default.discount.delete({
        where: { id: discountId },
    });
});
exports.deleteDiscountService = deleteDiscountService;
const updateDiscountService = (discountId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const discount = yield prisma_1.default.discount.findUnique({
        where: { id: discountId },
    });
    if (!discount) {
        throw new Error("Discount not found");
    }
    return yield prisma_1.default.discount.update({
        where: { id: discountId },
        data: Object.assign(Object.assign({}, data), { startDate: data.startDate ? new Date(data.startDate) : discount.startDate, endDate: data.endDate ? new Date(data.endDate) : discount.endDate }),
    });
});
exports.updateDiscountService = updateDiscountService;
const getDiscountByStoreId = (adminUser) => __awaiter(void 0, void 0, void 0, function* () {
    const accessibleStoreIds = yield (0, access_util_1.getAccessibleStoreIds)(adminUser);
    const discounts = yield prisma_1.default.discount.findMany({
        where: {
            storeId: {
                in: accessibleStoreIds,
            }
        },
        include: {
            product: true,
        },
    });
    return discounts;
});
exports.getDiscountByStoreId = getDiscountByStoreId;
