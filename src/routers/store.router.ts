import express from 'express';
import { createStoreController,deleteStoreController,getAllStoresController,getStoreByIdController,updateStoreController } from '../controllers/store.controller';

const router = express.Router();

router.get("/", getAllStoresController);
router.get("/:storeId", getStoreByIdController);
router.post("/", createStoreController);
router.put("/:storeId", updateStoreController);
router.delete("/:storeId", deleteStoreController);

export default router;