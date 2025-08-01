"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeSchema = void 0;
const zod_1 = require("zod");
exports.storeSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, "Nama toko minimal 3 karakter"),
    address: zod_1.z.string().min(10, "Alamat toko minimal 10 karakter"),
    city: zod_1.z.string().min(3, "Kota minimal 3 karakter"),
    latitude: zod_1.z
        .number()
        .refine((val) => Math.abs(val) <= 90, "Latitude tidak valid"),
    longitude: zod_1.z
        .number()
        .refine((val) => Math.abs(val) <= 180, "Longitude tidak valid"),
});
