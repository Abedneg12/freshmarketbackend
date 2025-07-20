import { createProductController, updateProductController, deleteProductController, getAllProductsController, getProductByIdController } from "../controllers/product.controller";
import { Multer } from "../utils/multer";
import express from 'express';

const router = express.Router();
const upload = Multer("memoryStorage", "product-", "products");

router.post("/", upload.array("images"), createProductController);
router.put("/:productId", upload.array("images"), updateProductController);
router.delete("/:productId", deleteProductController);
router.get("/", getAllProductsController);
router.get("/:productId", getProductByIdController);

export default router;