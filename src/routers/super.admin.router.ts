import express from 'express';
import { getAllUsersController, createStoreAdminController, assignStoreAdminController, deleteStoreAdminController, updateStoreAdminController } from "../controllers/super.admin.controller";
import { requireRole } from "../middlewares/roleMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";
import { UserRole } from "@prisma/client";

const router = express.Router();
router.get("/users", authMiddleware, requireRole([UserRole.SUPER_ADMIN]), getAllUsersController);
router.post("/store-admins", authMiddleware, requireRole([UserRole.SUPER_ADMIN]), createStoreAdminController);
router.post("/stores/:storeId/admins", authMiddleware, requireRole([UserRole.SUPER_ADMIN]), assignStoreAdminController);
router.delete("/store-admins/:userId", authMiddleware, requireRole([UserRole.SUPER_ADMIN]), deleteStoreAdminController);
router.put("/store-admins/:userId", authMiddleware, requireRole([UserRole.SUPER_ADMIN]), updateStoreAdminController);

export default router;