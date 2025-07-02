import { Router } from "express";
import { getRecommendations } from "../controllers/storeController";

const router = Router();

router.get("/recommendations", getRecommendations);

export default router;
