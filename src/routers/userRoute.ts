import { Router } from "express";
import {
  getProfileController,
  updateProfileController,
  changePasswordController,
  updateProfilePictureController,
  requestEmailUpdateController,
  confirmEmailUpdateController,
} from "../controllers/userController";
import { authOnlyMiddleware } from "../middlewares/authOnlyMiddleware";
import { Multer } from "../utils/multer";

const router = Router();

router.get("/profile", authOnlyMiddleware, getProfileController);
router.patch("/profile", authOnlyMiddleware, updateProfileController);
router.patch("/change-password", authOnlyMiddleware, changePasswordController);
router.patch(
  "/profile/picture",
  authOnlyMiddleware,
  Multer("memoryStorage").single('avatar'),
  updateProfilePictureController
);
router.post(
  "/request-email-update",
  authOnlyMiddleware,
  requestEmailUpdateController
);
router.get(
  "/confirm-email-update",
  authOnlyMiddleware,
  confirmEmailUpdateController
);

export default router;
