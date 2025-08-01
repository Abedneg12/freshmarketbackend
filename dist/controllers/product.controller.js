"use strict";
// src/controllers/product.controller.ts
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
exports.deleteProductController = exports.updateProductController = exports.createProductController = exports.getProductByIdController = exports.getProductsStoreAdminController = exports.getAllProductsController = void 0;
const product_service_1 = require("../services/product.service");
const inventory_service_1 = require("../services/inventory.service");
const product_service_2 = require("../services/product.service");
const getAllProductsController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield (0, product_service_1.getAllProducts)();
        res.status(200).json(products);
    }
    catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Failed to fetch products" });
        next(error);
    }
});
exports.getAllProductsController = getAllProductsController;
const getProductsStoreAdminController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adminUser = req.user;
        if (!adminUser) {
            res.status(401).json({ message: 'Unauthorized: Admin not found' });
            return;
        }
        const { page, limit, search, category, } = req.query;
        const result = yield (0, product_service_2.getProductsForStoreAdmin)(adminUser, {
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            search: search,
            category: category,
        });
        res.status(200).json(Object.assign({ message: 'Berhasil mengambil daftar produk untuk admin' }, result));
    }
    catch (error) {
        res.status(500).json({ message: 'Gagal mengambil daftar produk', error: error.message });
        next(error);
    }
});
exports.getProductsStoreAdminController = getProductsStoreAdminController;
const getProductByIdController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = parseInt(req.params.productId);
    try {
        const product = yield (0, product_service_1.getProductById)(productId);
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        res.status(200).json(product);
    }
    catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Failed to fetch product" });
        next(error);
    }
});
exports.getProductByIdController = getProductByIdController;
const createProductController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const productData = Object.assign(Object.assign({}, req.body), { categoryId: Number(req.body.categoryId), basePrice: parseFloat(req.body.basePrice) });
    const newFiles = req.files; // Multer will add this as 'images' field
    const storeAllocations = req.body.storeAllocations ? JSON.parse(req.body.storeAllocations) : []; // Parse store allocations
    try {
        const newProduct = yield (0, product_service_1.createProduct)(productData, newFiles);
        // Handle initial stock allocations for a new product
        if (newProduct.id && storeAllocations.length > 0) {
            for (const allocation of storeAllocations) {
                yield (0, inventory_service_1.updateProductStock)({
                    productId: newProduct.id,
                    storeId: allocation.storeId,
                    quantity: allocation.quantity,
                    type: allocation.type || 'IN', // Default to 'IN' for new product
                });
            }
        }
        res.status(201).json(newProduct);
    }
    catch (error) {
        res.status(500).json({ message: error.message || "Failed to create product" });
        next(error);
    }
});
exports.createProductController = createProductController;
const updateProductController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = parseInt(req.params.productId);
    if (isNaN(productId)) {
        res.status(400).json({ message: 'Invalid Product ID' });
        return;
    }
    // Parse basic product data
    const productData = {
        name: req.body.name,
        description: req.body.description,
        basePrice: req.body.basePrice ? parseFloat(req.body.basePrice) : undefined,
        categoryId: req.body.categoryId ? Number(req.body.categoryId) : undefined,
    };
    // Parse image-related data from JSON strings
    const imagesToDelete = req.body.imagesToDelete ? JSON.parse(req.body.imagesToDelete) : [];
    const newFiles = req.files; // These are the 'images' files from Multer
    // Parse store allocations
    const storeAllocations = req.body.storeAllocations ? JSON.parse(req.body.storeAllocations) : [];
    try {
        const updatedProduct = yield (0, product_service_1.updateProduct)(productId, productData, imagesToDelete, newFiles // Pass the files received from Multer
        );
        if (!updatedProduct) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        // Handle store stock adjustments separately using the inventory service
        if (storeAllocations.length > 0) {
            const adjustmentPromises = storeAllocations.map((allocation) => __awaiter(void 0, void 0, void 0, function* () {
                yield (0, inventory_service_1.updateProductStock)({
                    productId: productId,
                    storeId: allocation.storeId,
                    quantity: allocation.quantity,
                    type: allocation.type,
                });
            }));
            yield Promise.all(adjustmentPromises);
        }
        res.status(200).json(updatedProduct);
    }
    catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: error.message || "Failed to update product" });
        next(error);
    }
});
exports.updateProductController = updateProductController;
const deleteProductController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = parseInt(req.params.productId);
    try {
        const deletedProduct = yield (0, product_service_1.deleteProduct)(productId);
        if (!deletedProduct) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        res.status(200).json({ message: "Product deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Failed to delete product" });
        next(error);
    }
});
exports.deleteProductController = deleteProductController;
