"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToCartSchema = void 0;
const zod_1 = require("zod");
exports.addToCartSchema = zod_1.z.object({
    storeId: zod_1.z.number().int().positive(),
    productId: zod_1.z.number().int().positive(),
    quantity: zod_1.z.number().int().positive().min(1),
});
