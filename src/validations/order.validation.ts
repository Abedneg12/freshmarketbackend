// validations/order.validation.ts
import { z } from 'zod';

export const checkoutSchema = z.object({
  addressId: z.number({ required_error: 'addressId wajib diisi' }),
  paymentMethod: z.enum(['BANK_TRANSFER', 'MIDTRANS'], {
    required_error: 'paymentMethod wajib diisi',
    invalid_type_error: 'paymentMethod harus berupa enum yang valid',
  }), //payment method isi disini
  voucherCode: z.string().optional(),
  cartItemIds: z.array(z.number())
    .nonempty('cartItemIds tidak boleh kosong')
    .min(1, 'Minimal 1 item harus dipilih untuk checkout'),
});
