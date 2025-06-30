import { Request, Response, NextFunction } from "express";
import { getAllUsers, createStoreAdmin, assignStoreAdmin, deleteStoreAdmin, updateStoreAdmin, updateStoreAdminAssigment } from "../services/super.admin.service";

export const getAllUsersController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const users = await getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Failed to fetch users" });
        next(error);
    }
};

export const createStoreAdminController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, fullName, password } = req.body;
    try {
        const result = await createStoreAdmin(email, fullName, password);
        res.status(201).json(result);
    } catch (error) {
        console.error("Error creating store admin:", error);
        res.status(500).json({ message: "Failed to create store admin" });
        next(error);
    }
};

export const assignStoreAdminController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { userId, storeId } = req.body;
    try {
        const result = await assignStoreAdmin(userId, storeId);
        res.status(201).json(result);
    } catch (error) {
        console.error("Error creating store admin:", error);
        res.status(500).json({ message: "Failed to create store admin" });
        next(error);
    }
};

export const deleteStoreAdminController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { userId } = req.params;
    try {
        const result = await deleteStoreAdmin(Number(userId));
        res.status(200).json(result);
    } catch (error) {
        console.error("Error deleting store admin:", error);
        res.status(500).json({ message: "Failed to delete store admin" });
        next(error);
    }
};

export const updateStoreAdminController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { userId } = req.params;
    const data = req.body;
    try {
        const result = await updateStoreAdmin(Number(userId), data);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error updating store admin:", error);
        res.status(500).json({ message: "Failed to update store admin" });
        next(error);
    }
};

export const updateStoreAdminAssigmentController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { userId, storeId } = req.body;
    try {
        const result = await updateStoreAdminAssigment(Number(userId), Number(storeId));
        res.status(200).json(result);
    } catch (error) {
        console.error("Error updating store admin assignment:", error);
        res.status(500).json({ message: "Failed to update store admin assignment" });
        next(error);
    }
};
