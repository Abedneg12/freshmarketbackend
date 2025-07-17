import { Request, Response } from "express";
import { getRecommendedStores, getAllStores, getStoreProducts, getStoreById } from "../services/storeService";

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

export async function getAllStoresController(req: Request, res: Response) {
  try {
    const data = await getAllStores();
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getStoreProductsController (req: Request, res: Response) {
  const storeId = parseInt(req.params.storeId);
  if (isNaN(storeId)) {
    res.status(400).json({ error: "Invalid store ID" });
    return;
  }

  try {
    const data = await getStoreProducts(storeId);
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getStoreByIdController(req: Request, res: Response) {
  const storeId = parseInt(req.params.storeId);
  if (isNaN(storeId)) {
    res.status(400).json({ error: "Invalid store ID" });
    return;
  }

  try {
    const data = await getStoreById(storeId);
    if (!data) {
      res.status(404).json({ error: "Store not found" });
      return;
    }
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}