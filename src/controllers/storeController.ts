import { Request, Response } from "express";
import { getRecommendedStores } from "../services/storeService";

export async function getRecommendations(req: Request, res: Response) {
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const lng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;

    const data = await getRecommendedStores(lat, lng);
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
