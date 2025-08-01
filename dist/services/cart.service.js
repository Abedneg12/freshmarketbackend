"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCartCount = exports.clearCart = exports.updateQuantity = exports.removeItem = exports.getCart = exports.addItemToCart = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const addItemToCart = (userId, storeId, productId, quantity) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const stock = yield prisma_1.default.stock.findFirst({
        where: {
            storeId,
            productId,
        },
    });
    if (!stock) {
        throw new Error('Stok untuk produk ini di toko tersebut tidak tersedia');
    }
    let cart = yield prisma_1.default.cart.findFirst({
        where: { userId, storeId },
    });
    if (!cart) {
        cart = yield prisma_1.default.cart.create({
            data: { userId, storeId },
        });
    }
    const existingItem = yield prisma_1.default.cartItem.findFirst({
        where: { cartId: cart.id, productId },
    });
    const existingQuantity = (_a = existingItem === null || existingItem === void 0 ? void 0 : existingItem.quantity) !== null && _a !== void 0 ? _a : 0;
    const totalRequested = existingQuantity + quantity;
    if (stock.quantity < totalRequested) {
        throw new Error('Stok tidak mencukupi untuk jumlah yang diminta');
    }
    if (existingItem) {
        yield prisma_1.default.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: totalRequested },
        });
    }
    else {
        yield prisma_1.default.cartItem.create({
            data: { cartId: cart.id, productId, quantity },
        });
    }
    return (0, exports.getCart)(userId);
});
exports.addItemToCart = addItemToCart;
const getCart = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const carts = yield prisma_1.default.cart.findMany({
        where: { userId },
        include: {
            store: true,
            items: {
                include: {
                    product: {
                        include: {
                            images: true,
                            discounts: true,
                        },
                    },
                },
            },
        },
    });
    return carts;
});
exports.getCart = getCart;
const removeItem = (userId, itemId) => __awaiter(void 0, void 0, void 0, function* () {
    const item = yield prisma_1.default.cartItem.findUnique({
        where: { id: itemId },
        include: { cart: true },
    });
    if (!item || item.cart.userId !== userId) {
        throw new Error('Item not found or unauthorized');
    }
    yield prisma_1.default.cartItem.delete({ where: { id: itemId } });
    return (0, exports.getCart)(userId);
});
exports.removeItem = removeItem;
const updateQuantity = (userId, itemId, quantity) => __awaiter(void 0, void 0, void 0, function* () {
    const item = yield prisma_1.default.cartItem.findUnique({
        where: { id: itemId },
        include: {
            cart: true,
            product: true,
        },
    });
    if (!item || item.cart.userId !== userId) {
        throw new Error('Item tidak ditemukan atau tidak memiliki akses');
    }
    const stock = yield prisma_1.default.stock.findFirst({
        where: {
            storeId: item.cart.storeId,
            productId: item.productId,
        },
    });
    if (!stock) {
        throw new Error('Stok produk tidak tersedia di toko ini');
    }
    if (quantity > stock.quantity) {
        throw new Error('Jumlah melebihi stok tersedia');
    }
    yield prisma_1.default.cartItem.update({
        where: { id: itemId },
        data: { quantity },
    });
    return (0, exports.getCart)(userId);
});
exports.updateQuantity = updateQuantity;
const clearCart = (userId, storeId) => __awaiter(void 0, void 0, void 0, function* () {
    const cart = yield prisma_1.default.cart.findFirst({
        where: { userId, storeId },
    });
    if (!cart)
        return (0, exports.getCart)(userId);
    yield prisma_1.default.cartItem.deleteMany({ where: { cartId: cart.id } });
    return (0, exports.getCart)(userId);
});
exports.clearCart = clearCart;
const getCartCount = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const carts = yield prisma_1.default.cart.findMany({
        where: { userId },
        include: { items: true },
    });
    const totalQuantity = carts.reduce((sum, cart) => {
        return sum + cart.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);
    return totalQuantity;
});
exports.getCartCount = getCartCount;
