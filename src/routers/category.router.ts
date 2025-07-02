import express from 'express';
import { createCategoryController,deleteCategoryController,getAllCategoriesController,getCategoryByIdController,updateCategoryController } from '../controllers/category.controller';

const router = express.Router();

router.get("/", getAllCategoriesController);
router.get("/:categoryId", getCategoryByIdController);
router.post("/", createCategoryController);
router.put("/:categoryId", updateCategoryController);
router.delete("/:categoryId", deleteCategoryController);

export default router;
