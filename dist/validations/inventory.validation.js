"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductStockSchema = void 0;
const zod_1 = require("zod");
exports.updateProductStockSchema = zod_1.z.object({
    productId: zod_1.z.number(),
    storeId: zod_1.z.number(),
    quantity: zod_1.z.number().min(1),
    type: zod_1.z.enum(['IN', 'OUT']),
});
