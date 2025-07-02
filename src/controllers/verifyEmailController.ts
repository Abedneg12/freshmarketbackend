import { Request, Response } from "express";
import { verifySchema } from "../schema/authSchema";
import { verifyService } from "../services/verifyService";

export async function verifyController(req: Request, res: Response) {
  try {
    const { token, password } = verifySchema.parse(req.body);
    const result = await verifyService(token, password);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
