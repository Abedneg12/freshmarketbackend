import express from 'express';
import { createDiscountBOGOController, createDiscountProductController, createVoucherController, getAllDiscountsController, deleteDiscountController, updateDiscountController } from "../controllers/disocunt.controller";
import { requireRole } from "../middlewares/roleMiddleware";
import { verifiedOnlyMiddleware } from '../middlewares/verifiedOnlyMiddleware';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post("/bogo", verifiedOnlyMiddleware, requireRole([UserRole.SUPER_ADMIN]), createDiscountBOGOController);
router.post("/product", verifiedOnlyMiddleware, requireRole([UserRole.SUPER_ADMIN]), createDiscountProductController);
router.post("/voucher", verifiedOnlyMiddleware, requireRole([UserRole.SUPER_ADMIN]), createVoucherController);
router.get("/", verifiedOnlyMiddleware, requireRole([UserRole.SUPER_ADMIN]), getAllDiscountsController);
router.put("/:discountId", verifiedOnlyMiddleware, requireRole([UserRole.SUPER_ADMIN]), updateDiscountController);
router.delete("/:discountId", verifiedOnlyMiddleware, requireRole([UserRole.SUPER_ADMIN]), deleteDiscountController);

export default router;