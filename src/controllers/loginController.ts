import { Request, Response } from "express";
import { loginSchema } from "../schema/authSchema";
import { loginService } from "../services/loginService";

export async function loginController(req: Request, res: Response) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await loginService(email, password);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Login gagal" });
  }
}
