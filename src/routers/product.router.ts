import { createProductController, updateProductController, deleteProductController, getAllProductsController, getProductByIdController } from "../controllers/product.controller";
import { validateBody } from "../middlewares/validationMiddleware";
import { Multer } from "../utils/multer";
import express from 'express';
import { productCreateSchema, productUpdateSchema } from "../validations/product.validation";
import { authOnlyMiddleware } from "../middlewares/authOnlyMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";
import { UserRole } from "@prisma/client";

const router = express.Router();
const upload = Multer("memoryStorage", "product-", "products");

router.post("/", validateBody(productCreateSchema), authOnlyMiddleware, requireRole([UserRole.SUPER_ADMIN]), upload.array("images"), createProductController);
router.put("/:productId", validateBody(productUpdateSchema), authOnlyMiddleware, requireRole([UserRole.SUPER_ADMIN]), upload.array("images"), updateProductController);
router.delete("/:productId", authOnlyMiddleware, requireRole([UserRole.SUPER_ADMIN]), deleteProductController);
router.get("/", getAllProductsController);
router.get("/:productId", getProductByIdController);

export default router;