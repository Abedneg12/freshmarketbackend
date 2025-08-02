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
exports.getRecommendedStores = getRecommendedStores;
exports.getAllStores = getAllStores;
exports.getStoreProducts = getStoreProducts;
exports.getStoreById = getStoreById;
const prisma_1 = __importDefault(require("../lib/prisma"));
const haversine_1 = require("../utils/haversine");
const config_1 = require("../config");
function getRecommendedStores(lat, lng) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!lat || !lng) {
            if (!config_1.DEFAULT_STORE_ID) {
                throw new Error("Toko default belum dikonfigurasi di server.");
            }
            const defaultStore = yield prisma_1.default.store.findUnique({
                where: { id: Number(config_1.DEFAULT_STORE_ID) },
                include: {
                    products: {
                        include: {
                            product: {
                                include: {
                                    images: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!defaultStore) {
                return [];
            }
            const products = defaultStore.products.map((item) => {
                var _a, _b, _c;
                return ({
                    id: item.product.id,
                    name: item.product.name,
                    price: item.product.basePrice,
                    images: (_c = (_b = (_a = item.product.images) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.imageUrl) !== null && _c !== void 0 ? _c : "",
                    stock: item.quantity,
                });
            });
            return [
                {
                    id: defaultStore.id,
                    name: defaultStore.name,
                    images: defaultStore.imageUrl,
                    address: defaultStore.address,
                    distanceKm: 0,
                    products,
                },
            ];
        }
        if (!lat || !lng)
            throw new Error("Lokasi tidak valid.");
        const allStores = yield prisma_1.default.store.findMany({
            include: {
                products: {
                    include: {
                        product: {
                            include: {
                                images: true,
                            },
                        },
                    },
                },
            },
        });
        // filter dan hitung jarak ke toko
        const results = [];
        for (const store of allStores) {
            const dist = (0, haversine_1.calculateDistanceKm)(lat, lng, store.latitude, store.longitude);
            if (dist <= 7) {
                const products = store.products.map((item) => {
                    var _a, _b, _c;
                    return ({
                        id: item.product.id,
                        name: item.product.name,
                        price: item.product.basePrice,
                        imageUrl: (_c = (_b = (_a = item.product.images) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.imageUrl) !== null && _c !== void 0 ? _c : "",
                        stock: item.quantity,
                    });
                });
                results.push({
                    id: store.id,
                    name: store.name,
                    imageUrl: store.imageUrl,
                    address: store.address,
                    distanceKm: parseFloat(dist.toFixed(2)),
                    products,
                });
            }
        }
        return results;
    });
}
function getAllStores() {
    return __awaiter(this, void 0, void 0, function* () {
        const stores = yield prisma_1.default.store.findMany();
        return stores;
    });
}
function getStoreProducts(storeId) {
    return __awaiter(this, void 0, void 0, function* () {
        const store = yield prisma_1.default.store.findUnique({
            where: { id: storeId },
            include: {
                products: {
                    include: {
                        product: {
                            include: {
                                images: true,
                                category: true,
                                discounts: {
                                    where: { storeId: storeId },
                                },
                                stocks: true,
                            },
                        },
                    },
                },
            },
        });
        if (!store)
            throw new Error("Toko tidak ditemukan.");
        const products = store.products.map((item) => ({
            id: item.product.id,
            name: item.product.name,
            description: item.product.description,
            basePrice: item.product.basePrice,
            price: item.product.basePrice,
            category: item.product.category,
            categoryId: item.product.categoryId,
            createdAt: item.product.createdAt,
            images: item.product.images,
            stocks: item.product.stocks,
            discounts: item.product.discounts,
        }));
        return {
            id: store.id,
            name: store.name,
            imageUrl: store.imageUrl,
            address: store.address,
            products,
        };
    });
}
function getStoreById(storeId) {
    return __awaiter(this, void 0, void 0, function* () {
        const store = yield prisma_1.default.store.findUnique({
            where: { id: storeId },
            include: {
                products: {
                    include: {
                        product: {
                            include: {
                                images: true,
                                category: true,
                                discounts: true,
                                stocks: true,
                                cartItems: true,
                                orderItems: true,
                                InventoryJournal: true,
                                Voucher: true,
                            },
                        },
                    },
                },
                discounts: true,
                journals: true,
                orders: true,
                admins: true,
                carts: true,
            },
        });
        if (!store)
            throw new Error("Toko tidak ditemukan.");
        return store;
    });
}
