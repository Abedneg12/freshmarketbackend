import { z } from 'zod';

export const createDiscountServiceSchema = z.object({
  productId: z.number().optional(),
  storeId: z.number(),
  value: z.number().min(1),
  minPurchase: z.number().min(1).optional(),
  maxDiscount: z.number().optional(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start date",
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid end date",
  }),
  type: z.enum(["BUY1GET1", "NOMINAL", "PERCENTAGE"]),
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
    return Object.values(data).some(value => value !== undefined);
  }
  ).transform((data) => {
    return Object.fromEntries(Object.entries(data).filter(([_, value]) => value !== undefined));
  });
  