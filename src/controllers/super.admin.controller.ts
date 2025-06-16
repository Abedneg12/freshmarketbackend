import { Request, Response, NextFunction } from "express";
import { getAllUsers, assignStoreAdmin, deleteStoreAdmin, updateStoreAdmin } from "../services/super.admin.service";

export const getAllUsersController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
};

export const assignStoreAdminController = async (req: Request, res: Response, next: NextFunction) => {
    const { userId, storeId } = req.body;
    try {
        const result = await assignStoreAdmin(userId, storeId);
        res.status(201).json(result);
    } catch (error) {
        console.error("Error creating store admin:", error);
        res.status(500).json({ message: "Failed to create store admin" });
    }
};

export const deleteStoreAdminController = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    try {
        const result = await deleteStoreAdmin(Number(userId));
        res.status(200).json(result);
    } catch (error) {
        console.error("Error deleting store admin:", error);
        res.status(500).json({ message: "Failed to delete store admin" });
    }
};

export const updateStoreAdminController = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const data = req.body;
    try {
        const result = await updateStoreAdmin(Number(userId), data);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error updating store admin:", error);
        res.status(500).json({ message: "Failed to update store admin" });
    }
};
