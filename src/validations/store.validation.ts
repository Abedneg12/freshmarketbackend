import { z } from "zod";

export const storeSchema = z.object({
  name: z.string().min(3, "Nama toko minimal 3 karakter"),
  address: z.string().min(10, "Alamat toko minimal 10 karakter"),
  city: z.string().min(3, "Kota minimal 3 karakter"),
  latitude: z
    .number()
    .refine((val) => Math.abs(val) <= 90, "Latitude tidak valid"),
  longitude: z
    .number()
    .refine((val) => Math.abs(val) <= 180, "Longitude tidak valid"),
});
