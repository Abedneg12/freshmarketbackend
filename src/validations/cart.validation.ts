import { z } from 'zod';

export const addToCartSchema = z.object({
  storeId: z.number().int().positive(),
  productId: z.number().int().positive(),
  quantity: z.number().int().positive().min(1),
});
