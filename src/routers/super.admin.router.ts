import express from 'express';
import { getAllUsersController, createStoreAdminController, assignStoreAdminController, deleteStoreAdminController, updateStoreAdminController, updateStoreAdminAssigmentController } from "../controllers/super.admin.controller";
import { requireRole } from "../middlewares/roleMiddleware";
import { authOnlyMiddleware } from '../middlewares/authOnlyMiddleware';
import { validateBody } from '../middlewares/validationMiddleware';
import { registerStoreAdminSchema } from '../validations/super.admin.validation';
import { UserRole } from "@prisma/client";

const router = express.Router();
router.get("/users", authOnlyMiddleware, requireRole([UserRole.SUPER_ADMIN]), getAllUsersController);
router.post("/store-admins", authOnlyMiddleware, requireRole([UserRole.SUPER_ADMIN]), validateBody(registerStoreAdminSchema), createStoreAdminController);
router.post("/stores/:storeId/admins", authOnlyMiddleware, requireRole([UserRole.SUPER_ADMIN]), assignStoreAdminController);
router.delete("/store-admins/:userId", authOnlyMiddleware, requireRole([UserRole.SUPER_ADMIN]), deleteStoreAdminController);
router.put("/store-admins/:userId", authOnlyMiddleware, requireRole([UserRole.SUPER_ADMIN]), updateStoreAdminController);
router.put("/store-admins/:userId/assign", authOnlyMiddleware, requireRole([UserRole.SUPER_ADMIN]), updateStoreAdminAssigmentController);

export default router;