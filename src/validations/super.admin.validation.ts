import { z } from 'zod';

export const registerStoreAdminSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  storeId: z.number(),
});
