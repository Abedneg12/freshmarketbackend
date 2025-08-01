"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutSchema = void 0;
// validations/order.validation.ts
const zod_1 = require("zod");
exports.checkoutSchema = zod_1.z.object({
    addressId: zod_1.z.number({ required_error: 'addressId wajib diisi' }),
    paymentMethod: zod_1.z.enum(['BANK_TRANSFER', 'MIDTRANS'], {
        required_error: 'paymentMethod wajib diisi',
        invalid_type_error: 'paymentMethod harus berupa enum yang valid',
    }), //payment method isi disini
    voucherCode: zod_1.z.string().optional(),
    cartItemIds: zod_1.z.array(zod_1.z.number())
        .nonempty('cartItemIds tidak boleh kosong')
        .min(1, 'Minimal 1 item harus dipilih untuk checkout'),
});
