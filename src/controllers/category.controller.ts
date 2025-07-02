import { Request, Response, NextFunction } from "express";
import { createCategory,deleteCategory,getAllCategories,getCategoryById,updateCategory } from "../services/category.service";

export const getAllCategoriesController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const categories = await getAllCategories();
        res.status(200).json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Failed to fetch categories" });
        next(error);
    }
};

export const getCategoryByIdController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const categoryId = parseInt(req.params.categoryId);
    try {
        const category = await getCategoryById(categoryId);
        if (!category) {
            res.status(404).json({ message: "Category not found" });
            return;
        }
        res.status(200).json(category);
    } catch (error) {
        console.error("Error fetching category:", error);
        res.status(500).json({ message: "Failed to fetch category" });
        next(error);
    }
};

export const createCategoryController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const categoryData = req.body;
    try {
        const newCategory = await createCategory(categoryData);
        res.status(201).json(newCategory);
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ message: "Failed to create category" });
        next(error);
    }
};

export const updateCategoryController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const categoryId = parseInt(req.params.categoryId);
    const categoryData = req.body;
    try {
        const updatedCategory = await updateCategory(categoryId, categoryData);
        if (!updatedCategory) {
            res.status(404).json({ message: "Category not found" });
            return;
        }
        res.status(200).json(updatedCategory);
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ message: "Failed to update category" });
        next(error);
    }
};

export const deleteCategoryController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const categoryId = parseInt(req.params.categoryId);
    try {
        await deleteCategory(categoryId);
        res.status(204).send(); // No content
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ message: "Failed to delete category" });
        next(error);
    }
};