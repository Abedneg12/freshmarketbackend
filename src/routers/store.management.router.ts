import { Router } from "express";
import {
  getAllStoresController,
  createStoreController,
  updateStoreController,
  deleteStoreController,
} from "../controllers/store.controller";
import { validateBody } from "../middlewares/validationMiddleware";
import { storeSchema } from "../validations/store.validation";
import { authOnlyMiddleware } from "../middlewares/authOnlyMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";
import { UserRole } from "@prisma/client";

const router = Router();

router.use(authOnlyMiddleware, requireRole([UserRole.SUPER_ADMIN]));

router.get("/", getAllStoresController);
router.post("/", validateBody(storeSchema), createStoreController);

router.put("/:storeId", validateBody(storeSchema), updateStoreController);
router.delete("/:storeId", deleteStoreController);

export default router;
