import { Router } from "express";
import {
  getAllAddressesController,
  createAddressController,
  setMainAddressController,
  updateAddressController,
  deleteAddressController,
} from "../controllers/address.controller";
import { validateBody } from "../middlewares/validationMiddleware";
import { authOnlyMiddleware } from "../middlewares/authOnlyMiddleware";
import {
  addressSchema,
  updateAddressSchema,
} from "../validations/address.validation";

const router = Router();

router.use(authOnlyMiddleware); 

router.get("/", getAllAddressesController);
router.post("/", validateBody(addressSchema), createAddressController);
router.put(
  "/:addressId",
  validateBody(updateAddressSchema),
  updateAddressController
);
router.delete("/:addressId", deleteAddressController);
router.patch("/:addressId/set-main", setMainAddressController);

export default router;
