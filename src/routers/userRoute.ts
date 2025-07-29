import { Router } from "express";
import {
  getProfileController,
  updateProfileController,
  changePasswordController,
  updateProfilePictureController,
  requestEmailUpdateController,
  confirmEmailUpdateController,
  createPasswordController,
} from "../controllers/userController";
import { authOnlyMiddleware } from "../middlewares/authOnlyMiddleware";
import { Multer } from "../utils/multer";

const router = Router();

router.get("/confirm-email-update", confirmEmailUpdateController as any);

router.get("/profile", authOnlyMiddleware, getProfileController);
router.patch("/profile", authOnlyMiddleware, updateProfileController);
router.patch("/change-password", authOnlyMiddleware, changePasswordController);
router.patch(
  "/profile/picture",
  authOnlyMiddleware,
  Multer("memoryStorage").single("file"),
  updateProfilePictureController
);
router.post(
  "/request-email-update",
  authOnlyMiddleware,
  requestEmailUpdateController
);
router.post("/create-password", authOnlyMiddleware, createPasswordController);

export default router;
