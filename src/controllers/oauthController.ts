import { Request, Response } from "express";
import { OAuthLogin } from "../services/oauthService";
import { FE_PORT } from "../config";

export async function OAuthController(req: Request, res: Response) {
  const profile = req.user as unknown as {
    provider: "google" | "facebook";
    providerId: string;
    email: string;
    displayName: string;
  };

  try {
    const { token } = await OAuthLogin(profile);
    const redirectUrl = `${FE_PORT}/auth/success?token=${token}`;
    return res.redirect(redirectUrl);
  } catch (error) {
    const errorUrl = `${FE_PORT}/auth/error`;
    return res.redirect(errorUrl);
  }
}
