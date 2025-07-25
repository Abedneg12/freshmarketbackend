import express from 'express';
import { createCategoryController, deleteCategoryController, getAllCategoriesController, getCategoryByIdController, updateCategoryController } from '../controllers/category.controller';
import { authOnlyMiddleware } from '../middlewares/authOnlyMiddleware';
import { UserRole } from '@prisma/client';
import { requireRole } from '../middlewares/roleMiddleware';

const router = express.Router();

router.get("/", getAllCategoriesController);
router.get("/:categoryId", getCategoryByIdController);
router.post("/", authOnlyMiddleware, requireRole([UserRole.SUPER_ADMIN]), createCategoryController);
router.put("/:categoryId", authOnlyMiddleware, requireRole([UserRole.SUPER_ADMIN]), updateCategoryController);
router.delete("/:categoryId", authOnlyMiddleware, requireRole([UserRole.SUPER_ADMIN]), deleteCategoryController);

export default router;
