"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmPaymentSchema = void 0;
// src/validations/admin/order.admin.validation.ts
const zod_1 = require("zod");
exports.confirmPaymentSchema = zod_1.z.object({
    decision: zod_1.z.enum(['APPROVE', 'REJECT'], {
        required_error: "Input 'decision' wajib diisi",
        invalid_type_error: "Nilai 'decision' harus 'APPROVE' atau 'REJECT'",
    }),
});
