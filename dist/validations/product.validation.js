"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productUpdateSchema = exports.productCreateSchema = void 0;
const zod_1 = require("zod");
exports.productCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Product name must be at least 2 characters"),
    description: zod_1.z.string().min(5, "Description must be at least 5 characters"),
    basePrice: zod_1.z.preprocess((val) => parseFloat(String(val)), zod_1.z.number().min(0, "Base price must be a positive number")),
    categoryId: zod_1.z.preprocess((val) => parseInt(String(val), 10), zod_1.z.number().int().positive("Category ID must be a positive integer")),
});
exports.productUpdateSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    description: zod_1.z.string().min(5).optional(),
    basePrice: zod_1.z.preprocess((val) => parseFloat(String(val)), zod_1.z.number().min(0)).optional(),
    categoryId: zod_1.z.preprocess((val) => parseInt(String(val), 10), zod_1.z.number().int().positive()).optional(),
});
