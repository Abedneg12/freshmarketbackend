"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerStoreAdminSchema = void 0;
const zod_1 = require("zod");
exports.registerStoreAdminSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(3),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    storeId: zod_1.z.number(),
});
