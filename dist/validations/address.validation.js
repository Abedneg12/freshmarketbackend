"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAddressSchema = exports.addressSchema = void 0;
const zod_1 = require("zod");
exports.addressSchema = zod_1.z.object({
    label: zod_1.z.string().min(3, "Label alamat minimal 3 karakter"),
    recipient: zod_1.z.string().min(3, "Nama penerima minimal 3 karakter"),
    phone: zod_1.z.string().min(5, "Nomor telepon minimal 5 karakter"),
    addressLine: zod_1.z.string().min(10, "Detail alamat minimal 10 karakter"),
    city: zod_1.z.string().min(3, "Kota minimal 3 karakter"),
    province: zod_1.z.string().min(3, "Provinsi minimal 3 karakter"),
    postalCode: zod_1.z.string().min(5, "Kode pos minimal 5 karakter"),
    isMain: zod_1.z.boolean().optional(),
    latitude: zod_1.z.number().optional(),
    longitude: zod_1.z.number().optional(),
});
exports.updateAddressSchema = exports.addressSchema.partial();
