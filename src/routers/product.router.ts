import { createProductController, 
updateProductController, 
deleteProductController, 
getAllProductsController, 
getProductByIdController, 
getProductsStoreAdminController } from "../controllers/product.controller";
import { authOnlyMiddleware } from "../middlewares/authOnlyMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";
import { Multer } from "../utils/multer";
import express from 'express';

const router = express.Router();
const upload = Multer("diskStorage", "product-", "products");
router.get("/", getAllProductsController);
router.get("/:productId", getProductByIdController);
router.get('/katalog', getProductsStoreAdminController, authOnlyMiddleware, requireRole(['STORE_ADMIN']));
router.post("/", upload.array("images"), createProductController);
router.put("/:productId", upload.array("images"), updateProductController);
router.delete("/:productId", deleteProductController);


export default router;