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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategoryController = exports.updateCategoryController = exports.createCategoryController = exports.getCategoryByIdController = exports.getAllCategoriesController = void 0;
const category_service_1 = require("../services/category.service");
const getAllCategoriesController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield (0, category_service_1.getAllCategories)();
        res.status(200).json(categories);
    }
    catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Failed to fetch categories" });
        next(error);
    }
});
exports.getAllCategoriesController = getAllCategoriesController;
const getCategoryByIdController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const categoryId = parseInt(req.params.categoryId);
    try {
        const category = yield (0, category_service_1.getCategoryById)(categoryId);
        if (!category) {
            res.status(404).json({ message: "Category not found" });
            return;
        }
        res.status(200).json(category);
    }
    catch (error) {
        console.error("Error fetching category:", error);
        res.status(500).json({ message: "Failed to fetch category" });
        next(error);
    }
});
exports.getCategoryByIdController = getCategoryByIdController;
const createCategoryController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const categoryData = req.body;
    try {
        const newCategory = yield (0, category_service_1.createCategory)(categoryData);
        res.status(201).json(newCategory);
    }
    catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ message: "Failed to create category" });
        next(error);
    }
});
exports.createCategoryController = createCategoryController;
const updateCategoryController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const categoryId = parseInt(req.params.categoryId);
    const categoryData = req.body;
    try {
        const updatedCategory = yield (0, category_service_1.updateCategory)(categoryId, categoryData);
        if (!updatedCategory) {
            res.status(404).json({ message: "Category not found" });
            return;
        }
        res.status(200).json(updatedCategory);
    }
    catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ message: "Failed to update category" });
        next(error);
    }
});
exports.updateCategoryController = updateCategoryController;
const deleteCategoryController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const categoryId = parseInt(req.params.categoryId);
    try {
        yield (0, category_service_1.deleteCategory)(categoryId);
        res.status(204).send(); // No content
    }
    catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ message: "Failed to delete category" });
        next(error);
    }
});
exports.deleteCategoryController = deleteCategoryController;
