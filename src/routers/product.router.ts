import { createProductController, updateProductController, deleteProductController, getAllProductsController, getProductByIdController } from "../controllers/product.controller";
import { Multer } from "../utils/multer";
import express from 'express';

const router = express.Router();
const upload = Multer("diskStorage", "product-", "products");

router.post("/products", upload.array("images"), createProductController);
router.put("/products/:productId", upload.array("images"), updateProductController);
router.delete("/products/:productId", deleteProductController);
router.get("/products", getAllProductsController);
router.get("/products/:productId", getProductByIdController);

export default router;