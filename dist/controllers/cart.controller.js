"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCartCountController = exports.clearCartByStore = exports.updateItemQuantity = exports.removeItemFromCart = exports.getMyCart = exports.addItemToCart = void 0;
const cartService = __importStar(require("../services/cart.service"));
// Tambah item
const addItemToCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const { storeId, productId, quantity } = req.body;
    const result = yield cartService.addItemToCart(userId, storeId, productId, quantity);
    res.status(200).json(result);
});
exports.addItemToCart = addItemToCart;
// Ambil cart user
const getMyCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const result = yield cartService.getCart(userId);
    res.status(200).json(result);
});
exports.getMyCart = getMyCart;
// Hapus item dari cart
const removeItemFromCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const itemId = Number(req.params.itemId);
    const result = yield cartService.removeItem(userId, itemId);
    res.status(200).json(result);
});
exports.removeItemFromCart = removeItemFromCart;
// Update jumlah item
const updateItemQuantity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const itemId = Number(req.params.itemId);
    const { quantity } = req.body;
    const result = yield cartService.updateQuantity(userId, itemId, quantity);
    res.status(200).json(result);
});
exports.updateItemQuantity = updateItemQuantity;
// Kosongkan seluruh cart di 1 toko
const clearCartByStore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const storeId = Number(req.params.storeId);
    const result = yield cartService.clearCart(userId, storeId);
    res.status(200).json(result);
});
exports.clearCartByStore = clearCartByStore;
// Ambil jumlah item di keranjang untuk notifikasi
const getCartCountController = (req, res) => {
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
exports.getCartCountController = getCartCountController;
