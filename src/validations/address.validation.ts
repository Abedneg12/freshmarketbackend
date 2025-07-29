import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().min(3, "Label alamat minimal 3 karakter"),
  recipient: z.string().min(3, "Nama penerima minimal 3 karakter"),
  phone: z.string().min(5, "Nomor telepon minimal 5 karakter"),
  addressLine: z.string().min(10, "Detail alamat minimal 10 karakter"),
  city: z.string().min(3, "Kota minimal 3 karakter"),
  province: z.string().min(3, "Provinsi minimal 3 karakter"),
  postalCode: z.string().min(5, "Kode pos minimal 5 karakter"),
  isMain: z.boolean().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const updateAddressSchema = addressSchema.partial();
