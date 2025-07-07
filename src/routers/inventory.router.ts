import express from "express";
import { updateProductStockController } from "../controllers/inventory.controller";
import { authOnlyMiddleware } from "../middlewares/authOnlyMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";
import { UserRole } from "@prisma/client";

const router = express.Router();
router.post("/stock", authOnlyMiddleware, requireRole([UserRole.SUPER_ADMIN, UserRole.STORE_ADMIN]), updateProductStockController);
export default router;