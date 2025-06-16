import { Router } from "express";
import { getAllUsersController, assignStoreAdminController, deleteStoreAdminController, updateStoreAdminController } from "../controllers/super.admin.controller";

const router = Router();
router.get("/users", getAllUsersController);
router.post("/assign-store-admin", assignStoreAdminController);
router.delete("/delete-store-admin/:userId", deleteStoreAdminController);
router.put("/update-store-admin/:userId", updateStoreAdminController);

export default router;