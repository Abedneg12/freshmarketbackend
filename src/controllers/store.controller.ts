import { Request, Response } from "express";
import * as storeService from "../services/store.service";

export const getAllStoresController = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;

    const { stores, totalStores } = await storeService.getAllStores(
      page,
      limit
    );

    res.status(200).json({
      data: stores,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalStores / limit),
        totalStores: totalStores,
      },
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Gagal mengambil data toko", error: error.message });
  }
};

export const createStoreController = async (req: Request, res: Response) => {
  try {
    const newStore = await storeService.createStore(req.body);
    res.status(201).json(newStore);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Gagal membuat toko baru", error: error.message });
  }
};

export const updateStoreController = async (req: Request, res: Response) => {
  try {
    const storeId = parseInt(req.params.storeId, 10);
    const updatedStore = await storeService.updateStore(storeId, req.body);
    res.status(200).json(updatedStore);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Gagal memperbarui toko", error: error.message });
  }
};

export const deleteStoreController = async (req: Request, res: Response) => {
  try {
    const storeId = parseInt(req.params.storeId, 10);
    await storeService.deleteStore(storeId);
    res.status(200).json({ message: "Toko berhasil dihapus." });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Gagal menghapus toko", error: error.message });
  }
};
