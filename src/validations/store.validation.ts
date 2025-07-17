import { z } from "zod";

export const storeSchema = z.object({
  name: z.string().min(3, "Nama toko minimal 3 karakter"),
  address: z.string().min(10, "Alamat toko minimal 10 karakter"),
});
