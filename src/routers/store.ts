import { Router } from "express";
import { getRecommendations, getAllStoresController, getStoreProductsController, getStoreByIdController} from "../controllers/storeController";

const router = Router();

router.get("/recommendations", getRecommendations);
router.get("/all", getAllStoresController);
router.get("/:storeId/products", getStoreProductsController);
router.get("/:storeId", getStoreByIdController);

export default router;
