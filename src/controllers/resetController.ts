import { Request, Response } from "express";
import { resetRequestSchema, resetConfirmSchema } from "../schema/authSchema";
import {
  requestResetPasswordService,
  confirmResetPasswordService,
} from "../services/resetPasswordService";

export async function requestResetController(req: Request, res: Response) {
  try {
    const { email } = resetRequestSchema.parse(req.body);
    const result = await requestResetPasswordService(email);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({
      error: error.message || "Terjadi kesalahan saat reset password",
    });
  }
}

export async function confirmResetController(req: Request, res: Response) {
  try {
    const { token, password } = resetConfirmSchema.parse(req.body);
    const result = await confirmResetPasswordService(token, password);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({
      error: error.message || "Terjadi kesalahan saat reset password",
    });
  }
}
