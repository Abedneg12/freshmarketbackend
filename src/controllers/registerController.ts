import { Request, Response } from "express";
import { registerSchema } from "../schema/authSchema";
import {
  registerService,
  resendVerificationService,
} from "../services/registerService";

export async function registerController(req: Request, res: Response) {
  try {
    const data = registerSchema.parse(req.body);
    const result = await registerService(data);
    res.json(result);
  } catch (error: any) {
    res
      .status(400)
      .json({ error: error.message || "Terjadi kesalahan saat registrasi" });
  }
}

export async function resendVerificationController(
  req: Request,
  res: Response
) {
  try {
    const { email } = req.body;
    const result = await resendVerificationService(email);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
