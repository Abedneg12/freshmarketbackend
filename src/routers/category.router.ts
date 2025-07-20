import express from 'express';
import { createCategoryController, deleteCategoryController, getAllCategoriesController, getCategoryByIdController, updateCategoryController } from '../controllers/category.controller';
import { authOnlyMiddleware } from '../middlewares/authOnlyMiddleware';
import { UserRole } from '@prisma/client';
import { requireRole } from '../middlewares/roleMiddleware';

const router = express.Router();

router.use(authOnlyMiddleware, requireRole([UserRole.SUPER_ADMIN]));

router.get("/", getAllCategoriesController);
router.get("/:categoryId", getCategoryByIdController);
router.post("/", createCategoryController);
router.put("/:categoryId", updateCategoryController);
router.delete("/:categoryId", deleteCategoryController);

export default router;
