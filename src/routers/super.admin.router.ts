import express from 'express';
import { getAllUsersController, createStoreAdminController, assignStoreAdminController, deleteStoreAdminController, updateStoreAdminController, updateStoreAdminAssigmentController } from "../controllers/super.admin.controller";
import { requireRole } from "../middlewares/roleMiddleware";
import { authOnlyMiddleware } from '../middlewares/authOnlyMiddleware';
import { validateBody } from '../middlewares/validationMiddleware';
import { registerStoreAdminSchema } from '../validations/super.admin.validation';
import { UserRole } from "@prisma/client";

const router = express.Router();

router.use(authOnlyMiddleware, requireRole([UserRole.SUPER_ADMIN]));

router.get("/users", getAllUsersController);
router.post("/store-admins", validateBody(registerStoreAdminSchema), createStoreAdminController);
router.post("/stores/:storeId/admins", assignStoreAdminController);
router.delete("/store-admins/:userId", deleteStoreAdminController);
router.put("/store-admins/:userId", updateStoreAdminController);
router.put("/store-admins/:userId/assign", updateStoreAdminAssigmentController);

export default router;