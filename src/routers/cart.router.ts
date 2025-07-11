import { Router } from 'express';
import * as cartController from '../controllers/cart.controller';
import { verifiedOnlyMiddleware } from '../middlewares/verifiedOnlyMiddleware';
import { validateBody } from '../middlewares/validationMiddleware';
import { addToCartSchema } from '../validations/cart.validation';

const router = Router();

// Semua route hanya untuk user yang sudah login dan terverifikasi
router.use(verifiedOnlyMiddleware);

// Tambah item ke cart
router.post('/add', validateBody(addToCartSchema), cartController.addItemToCart);

// Ambil semua cart user
router.get('/', cartController.getMyCart);

// Ambil jumlah total item untuk tampilan navbar
router.get('/count', cartController.getCartCountController);

// Update jumlah item (misal tombol + / -)
router.patch('/items/:itemId', cartController.updateItemQuantity);

// Hapus item dari cart
router.delete('/items/:itemId', cartController.removeItemFromCart);

// Kosongkan seluruh cart dari 1 toko
router.delete('/stores/:storeId', cartController.clearCartByStore);

export default router;
