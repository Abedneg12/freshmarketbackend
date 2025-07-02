import { Router } from "express";
import {
  registerController,
  resendVerificationController,
} from "../controllers/registerController";
import { verifyController } from "../controllers/verifyEmailController";
import { loginController } from "../controllers/loginController";
import {
  requestResetController,
  confirmResetController,
} from "../controllers/resetController";
import { validateBody } from "../middlewares/validationMiddleware";
import {
  loginSchema,
  registerSchema,
  resetRequestSchema,
  verifySchema,
} from "../schema/authSchema";

const router = Router();

router.post("/register", validateBody(registerSchema), registerController);

router.post("/verify-email", validateBody(verifySchema), verifyController);

router.post("/resend-verification", resendVerificationController);

router.post("/login", validateBody(loginSchema), loginController);

router.post(
  "/reset-password",
  validateBody(resetRequestSchema),
  requestResetController
);
router.post(
  "/reset-password/confirm",
  validateBody(verifySchema),
  confirmResetController
);

export default router;
