import express from 'express';
import { createDiscountBOGOController, createDiscountProductController, createVoucherController, getAllDiscountsController, deleteDiscountController, updateDiscountController } from "../controllers/disocunt.controller";
import { requireRole } from "../middlewares/roleMiddleware";
import { verifiedOnlyMiddleware } from '../middlewares/verifiedOnlyMiddleware';

const router = express.Router();

router.post("/bogo", verifiedOnlyMiddleware, requireRole(['STORE_ADMIN']), createDiscountBOGOController);
router.post("/product", verifiedOnlyMiddleware, requireRole(['STORE_ADMIN']), createDiscountProductController);
router.post("/voucher", verifiedOnlyMiddleware, requireRole(['STORE_ADMIN']), createVoucherController);
router.get("/", verifiedOnlyMiddleware, requireRole(['STORE_ADMIN']), getAllDiscountsController);
router.put("/:discountId", verifiedOnlyMiddleware, requireRole(['STORE_ADMIN']), updateDiscountController);
router.delete("/:discountId", verifiedOnlyMiddleware, requireRole(['STORE_ADMIN']), deleteDiscountController);

export default router;