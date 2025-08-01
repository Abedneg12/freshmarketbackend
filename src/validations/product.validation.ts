import { z } from "zod";

export const productCreateSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  basePrice: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().min(0, "Base price must be a positive number")
  ),
  categoryId: z.preprocess(
    (val) => parseInt(String(val), 10),
    z.number().int().positive("Category ID must be a positive integer")
  ),
});

export const productUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().min(5).optional(),
  basePrice: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().min(0)
  ).optional(),
  categoryId: z.preprocess(
    (val) => parseInt(String(val), 10),
    z.number().int().positive()
  ).optional(),
});
