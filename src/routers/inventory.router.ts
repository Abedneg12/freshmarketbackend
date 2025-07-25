import express from "express";
import { updateProductStockController } from "../controllers/inventory.controller";
import { authOnlyMiddleware } from "../middlewares/authOnlyMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";
import { UserRole } from "@prisma/client";
import { validateBody } from "../middlewares/validationMiddleware";
import { updateProductStockSchema } from "../validations/inventory.validation";

const router = express.Router();
router.post("/stock", validateBody(updateProductStockSchema), authOnlyMiddleware, requireRole([UserRole.SUPER_ADMIN]), updateProductStockController);
export default router;