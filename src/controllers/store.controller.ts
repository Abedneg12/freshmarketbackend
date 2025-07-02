import { Request, Response, NextFunction } from "express";
import { createStore, deleteStore, getAllStores, getStoreById, updateStore } from "../services/store.service";

export const getAllStoresController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const stores = await getAllStores();
        res.status(200).json(stores);
    } catch (error) {
        console.error("Error fetching stores:", error);
        res.status(500).json({ message: "Failed to fetch stores" });
        next(error);
    }
};

export const getStoreByIdController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const storeId = parseInt(req.params.storeId);
    try {
        const store = await getStoreById(storeId);
        if (!store) {
            res.status(404).json({ message: "Store not found" });
            return;
        }
        res.status(200).json(store);
    } catch (error) {
        console.error("Error fetching store:", error);
        res.status(500).json({ message: "Failed to fetch store" });
        next(error);
    }
};

export const createStoreController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const storeData = req.body;
    try {
        const newStore = await createStore(storeData);
        res.status(201).json(newStore);
    } catch (error) {
        console.error("Error creating store:", error);
        res.status(500).json({ message: "Failed to create store" });
        next(error);
    }
};

export const updateStoreController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const storeId = parseInt(req.params.storeId);
    const storeData = req.body;
    try {
        const updatedStore = await updateStore(storeId, storeData);
        if (!updatedStore) {
            res.status(404).json({ message: "Store not found" });
            return;
        }
        res.status(200).json(updatedStore);
    } catch (error) {
        console.error("Error updating store:", error);
        res.status(500).json({ message: "Failed to update store" });
        next(error);
    }
};

export const deleteStoreController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const storeId = parseInt(req.params.storeId);
    try {
        const deletedStore = await deleteStore(storeId);
        if (!deletedStore) {
            res.status(404).json({ message: "Store not found" });
            return;
        }
        res.status(200).json({ message: "Store deleted successfully" });
    } catch (error) {
        console.error("Error deleting store:", error);
        res.status(500).json({ message: "Failed to delete store" });
        next(error);
    }
};