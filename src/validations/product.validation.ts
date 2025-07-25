import { z } from "zod";

export const productCreateSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  basePrice: z.number().min(0, "Base price must be a positive number"),
  categoryId: z.number().int().positive("Category ID must be a positive integer"),
});

export const productUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().min(5).optional(),
  basePrice: z.number().min(0).optional(),
  categoryId: z.number().int().positive().optional(),
});
