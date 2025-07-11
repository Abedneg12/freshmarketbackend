import { Router } from "express";
import { getShippingCostController } from "../controllers/shipping.controller";

const router = Router();

router.post("/cost", getShippingCostController);

export default router;
