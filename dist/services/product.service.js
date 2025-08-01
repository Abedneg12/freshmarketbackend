"use strict";
// src/services/product.service.ts
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
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProductsForStoreAdmin = exports.getAllProducts = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const cloudinary_1 = require("../utils/cloudinary");
const getAllProducts = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield prisma_1.default.product.findMany({
            include: {
                category: true,
                images: true,
                stocks: {
                    include: {
                        store: true,
                    },
                },
                discounts: true,
                cartItems: true,
                orderItems: true,
                InventoryJournal: true,
                Voucher: true,
            },
        });
    }
    catch (err) {
        console.error("Error fetching products:", err);
        throw new Error("Failed to fetch products");
    }
});
exports.getAllProducts = getAllProducts;
const getProductsForStoreAdmin = (adminUser_1, ...args_1) => __awaiter(void 0, [adminUser_1, ...args_1], void 0, function* (adminUser, filters = {}) {
    try {
        const { page = 1, limit = 10, search, category } = filters;
        const skip = (page - 1) * limit;
        const assignments = yield prisma_1.default.storeAdminAssignment.findMany({
            where: { userId: adminUser.id },
            select: { storeId: true },
        });
        const assignedStoreIds = assignments.map(a => a.storeId);
        if (assignedStoreIds.length === 0) {
            return {
                data: [],
                pagination: { total: 0, page, limit, totalPages: 0 }
            };
        }
        const whereClause = {
            stocks: {
                some: {
                    storeId: {
                        in: assignedStoreIds,
                    },
                },
            },
        };
        if (search) {
            whereClause.name = {
                contains: search,
                mode: 'insensitive',
            };
        }
        if (category) {
            whereClause.categoryId = parseInt(category, 10);
        }
        const products = yield prisma_1.default.product.findMany({
            where: whereClause,
            include: {
                category: true,
                images: true,
                stocks: {
                    where: {
                        storeId: {
                            in: assignedStoreIds,
                        }
                    }
                }
            },
            skip: skip,
            take: limit,
            orderBy: { name: 'asc' }
        });
        const totalProducts = yield prisma_1.default.product.count({ where: whereClause });
        return {
            data: products,
            pagination: {
                total: totalProducts,
                page,
                limit,
                totalPages: Math.ceil(totalProducts / limit),
            }
        };
    }
    catch (err) {
        console.error("Error fetching products for store admin:", err);
        throw new Error("Failed to fetch products");
    }
});
exports.getProductsForStoreAdmin = getProductsForStoreAdmin;
const getProductById = (productId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield prisma_1.default.product.findUnique({
            where: { id: productId },
            include: {
                category: true,
                images: true,
                stocks: true,
                discounts: true,
                cartItems: true,
                orderItems: true,
                InventoryJournal: true,
                Voucher: true,
            },
        });
    }
    catch (err) {
        console.error("Error fetching product:", err);
        throw new Error("Failed to fetch product");
    }
});
exports.getProductById = getProductById;
const createProduct = (data, newFiles) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existing = yield prisma_1.default.product.findFirst({
            where: { name: data.name }
        });
        if (existing) {
            throw new Error("Product name already exists");
        }
        let imageRecords = [];
        if (newFiles && newFiles.length > 0) {
            for (const file of newFiles) {
                const uploadResult = yield (0, cloudinary_1.cloudinaryUpload)(file);
                imageRecords.push({ imageUrl: uploadResult.secure_url });
            }
        }
        return yield prisma_1.default.product.create({
            data: Object.assign(Object.assign({}, data), { images: imageRecords.length > 0
                    ? { create: imageRecords }
                    : undefined }),
            include: {
                images: true,
            },
        });
    }
    catch (err) {
        console.error("Error creating product:", err);
        throw new Error("Failed to create product");
    }
});
exports.createProduct = createProduct;
const updateProduct = (productId, data, imagesToDelete, files) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Remove images from Cloudinary
        if (imagesToDelete.length > 0) {
            yield prisma_1.default.productImage.deleteMany({
                where: {
                    productId: productId,
                    imageUrl: { in: imagesToDelete }
                }
            });
            for (const imageUrl of imagesToDelete) {
                try {
                    yield (0, cloudinary_1.cloudinaryRemove)(imageUrl);
                }
                catch (error) {
                    console.error(`Failed to remove image from Cloudinary: ${imageUrl}`, error);
                }
            }
        }
        const newImageRecords = [];
        if (files && files.length > 0) {
            for (const file of files) {
                const uploadResult = yield (0, cloudinary_1.cloudinaryUpload)(file);
                newImageRecords.push({ imageUrl: uploadResult.secure_url });
            }
            if (newImageRecords.length > 0) {
                yield prisma_1.default.productImage.createMany({
                    data: newImageRecords.map(img => (Object.assign(Object.assign({}, img), { productId: productId })))
                });
            }
        }
        return yield prisma_1.default.product.update({
            where: { id: productId },
            data: {
                name: data.name,
                description: data.description,
                basePrice: data.basePrice,
                categoryId: data.categoryId,
            },
            include: {
                images: true,
            },
        });
    }
    catch (err) {
        console.error("Error updating product:", err);
        throw new Error("Failed to update product");
    }
});
exports.updateProduct = updateProduct;
const deleteProduct = (productId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productToDelete = yield prisma_1.default.product.findUnique({
            where: { id: productId },
            include: { images: true }
        });
        if (!productToDelete) {
            throw new Error("Product not found");
        }
        for (const image of productToDelete.images) {
            try {
                yield (0, cloudinary_1.cloudinaryRemove)(image.imageUrl);
            }
            catch (error) {
                console.error(`Failed to remove image from Cloudinary: ${image.imageUrl}`, error);
            }
        }
        yield prisma_1.default.productImage.deleteMany({
            where: { productId: productId }
        });
        // ...rest of your delete logic...
        return yield prisma_1.default.product.delete({
            where: { id: productId },
        });
    }
    catch (err) {
        console.error("Error deleting product:", err);
        throw new Error(`Failed to delete product: ${err instanceof Error ? err.message : String(err)}`);
    }
});
exports.deleteProduct = deleteProduct;
