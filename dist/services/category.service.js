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
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryById = exports.getAllCategories = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const getAllCategories = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield prisma_1.default.productCategory.findMany({
            select: {
                id: true,
                name: true,
                products: {
                    select: {
                        id: true,
                        name: true
                    },
                }
            },
        });
    }
    catch (err) {
        console.error("Error fetching categories:", err);
        throw new Error("Failed to fetch categories");
    }
});
exports.getAllCategories = getAllCategories;
const getCategoryById = (categoryId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield prisma_1.default.productCategory.findUnique({
            where: { id: categoryId },
            include: {
                products: true,
            },
        });
    }
    catch (err) {
        console.error("Error fetching category:", err);
        throw new Error("Failed to fetch category");
    }
});
exports.getCategoryById = getCategoryById;
const createCategory = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield prisma_1.default.productCategory.create({
            data,
        });
    }
    catch (err) {
        console.error("Error creating category:", err);
        throw new Error("Failed to create category");
    }
});
exports.createCategory = createCategory;
const updateCategory = (categoryId, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield prisma_1.default.productCategory.update({
            where: { id: categoryId },
            data,
        });
    }
    catch (err) {
        console.error("Error updating category:", err);
        throw new Error("Failed to update category");
    }
});
exports.updateCategory = updateCategory;
const deleteCategory = (categoryId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield prisma_1.default.productCategory.delete({
            where: { id: categoryId },
        });
    }
    catch (err) {
        console.error("Error deleting category:", err);
        throw new Error("Failed to delete category");
    }
});
exports.deleteCategory = deleteCategory;
