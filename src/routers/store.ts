import { Router } from "express";
import { getRecommendations, getAllStoresController} from "../controllers/storeController";

const router = Router();

router.get("/recommendations", getRecommendations);
router.get("/all", getAllStoresController);

export default router;
