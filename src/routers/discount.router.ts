import express from 'express';
import { createDiscountController, getAllDiscountsController, deleteDiscountController, updateDiscountController } from "../controllers/disocunt.controller";
import { requireRole } from "../middlewares/roleMiddleware";
import { verifiedOnlyMiddleware } from '../middlewares/verifiedOnlyMiddleware';
import { UserRole } from '@prisma/client';
import { validateBody } from '../middlewares/validationMiddleware';
import { createDiscountServiceSchema } from '../validations/discount.validation';
import { authOnlyMiddleware } from '../middlewares/authOnlyMiddleware';

const router = express.Router();

router.use(authOnlyMiddleware, requireRole([UserRole.STORE_ADMIN]));

router.post("/", validateBody(createDiscountServiceSchema), createDiscountController);
router.get("/", getAllDiscountsController);
router.put("/:discountId", updateDiscountController);
router.delete("/:discountId", deleteDiscountController);

export default router;