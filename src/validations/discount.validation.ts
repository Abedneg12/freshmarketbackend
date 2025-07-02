import { z } from 'zod';

export const createDiscountProductSchema = z.object({
  productId: z.number().min(1),
  storeId: z.number().min(1),
  value: z.number().min(1),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start date",
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid end date",
  }),
});

export const createDiscountVoucherSchema = z.object({
  storeId: z.number().min(1),
  value: z.number().min(1),
  minPurchase: z.number().min(1),
  maxDiscount: z.number().optional(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start date",
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid end date",
  }),
});

export const createDiscountBOGOProductSchema = z.object({
  productId: z.number().min(1),
  storeId: z.number().min(1),
  value: z.number().min(1),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start date",
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid end date",
  }),
});

export const updateDiscountServiceSchema = z.object({
  value: z.number().min(1).optional(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start date",
  }).optional(),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid end date",
  }).optional(),
  minPurchase: z.number().min(1).optional(),
  maxDiscount: z.number().optional(), 
  }).refine((data) => {
    // Ensure at least one field is provided for update
    return Object.values(data).some(value => value !== undefined);
  }
  ).transform((data) => {
    // Remove undefined values to avoid sending them to the database
    return Object.fromEntries(Object.entries(data).filter(([_, value]) => value !== undefined));
  });
  