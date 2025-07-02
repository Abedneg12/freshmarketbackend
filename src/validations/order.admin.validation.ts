// src/validations/admin/order.admin.validation.ts
import { z } from 'zod';

export const confirmPaymentSchema = z.object({
  decision: z.enum(['APPROVE', 'REJECT'], {
    required_error: "Input 'decision' wajib diisi",
    invalid_type_error: "Nilai 'decision' harus 'APPROVE' atau 'REJECT'",
  }),
});