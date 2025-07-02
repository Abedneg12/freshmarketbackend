import { Router } from "express";
import passport from "../utils/passport";
import { OAuthController } from "../controllers/oauthController";

const router = Router();

// inisiasi OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  OAuthController
);

export default router;
