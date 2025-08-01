"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDiscountServiceSchema = exports.createDiscountServiceSchema = void 0;
const zod_1 = require("zod");
exports.createDiscountServiceSchema = zod_1.z.object({
    productId: zod_1.z.number().optional(),
    storeId: zod_1.z.number(),
    value: zod_1.z.number().min(1),
    minPurchase: zod_1.z.number().min(1).optional(),
    maxDiscount: zod_1.z.number().optional(),
    startDate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid start date",
    }),
    endDate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid end date",
    }),
    type: zod_1.z.enum(["BUY1GET1", "NOMINAL", "PERCENTAGE"]),
});
exports.updateDiscountServiceSchema = zod_1.z.object({
    value: zod_1.z.number().min(1).optional(),
    startDate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid start date",
    }).optional(),
    endDate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid end date",
    }).optional(),
    minPurchase: zod_1.z.number().min(1).optional(),
    maxDiscount: zod_1.z.number().optional(),
}).refine((data) => {
    return Object.values(data).some(value => value !== undefined);
}).transform((data) => {
    return Object.fromEntries(Object.entries(data).filter(([_, value]) => value !== undefined));
});
