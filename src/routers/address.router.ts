import { Router } from "express";
import {
  getAllAddressesController,
  createAddressController,
  updateAddressController,
  deleteAddressController,
} from "../controllers/address.controller";
import { validateBody } from "../middlewares/validationMiddleware";
import { authOnlyMiddleware } from "../middlewares/authOnlyMiddleware";
import { addressSchema } from "../validations/address.validation";

const router = Router();

router.use(authOnlyMiddleware);

router.get("/", getAllAddressesController);
router.post("/", validateBody(addressSchema), createAddressController);
router.put(
  "/:id",
  validateBody(addressSchema.partial()),
  updateAddressController
);
router.delete("/:id", deleteAddressController);

export default router;
