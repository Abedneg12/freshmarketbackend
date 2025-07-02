import { Request, Response } from "express";
import * as cartService from "../services/cart.service";

// Tambah item
export const addItemToCart = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { storeId, productId, quantity } = req.body;
    const result = await cartService.addItemToCart(userId, storeId, productId, quantity);
    res.status(200).json(result);
};

// Ambil cart user
export const getMyCart = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await cartService.getCart(userId);
    res.status(200).json(result);
};

// Hapus item dari cart
export const removeItemFromCart = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const itemId = Number(req.params.itemId);
    const result = await cartService.removeItem(userId, itemId);
    res.status(200).json(result);
};

// Update jumlah item
export const updateItemQuantity = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const itemId = Number(req.params.itemId);
    const { quantity } = req.body;
    const result = await cartService.updateQuantity(userId, itemId, quantity);
    res.status(200).json(result);
};

// Kosongkan seluruh cart di 1 toko
export const clearCartByStore = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const storeId = Number(req.params.storeId);
    const result = await cartService.clearCart(userId, storeId);
    res.status(200).json(result);
};

// Ambil jumlah item di keranjang untuk notifikasi
export const getCartCountController = (req: Request, res: Response): void => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    cartService.getCartCount(req.user.id)
        .then(count => {
            res.json({ count });
        })
        .catch(error => {
            console.error('[Cart Count Error]', error);
            res.status(500).json({ message: 'Gagal mengambil jumlah item di keranjang' });
        });
};
