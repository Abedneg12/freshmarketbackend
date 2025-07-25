import { z } from 'zod';

export const updateProductStockSchema = z.object({
  productId: z.number(),
  storeId: z.number(),
  quantity: z.number().min(1),
  type: z.enum(['IN', 'OUT']),
});