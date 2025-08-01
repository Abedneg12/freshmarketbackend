import { Request, Response, NextFunction } from "express";
import { Discount, DiscountType } from "../interfaces/discount.type";
import { createDiscountService, deleteDiscountService, getAllDiscountsService, updateDiscountService } from "../services/discount.service";

export const createDiscountController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const discount: Discount & { type: DiscountType } = req.body;
    try {
        const result = await createDiscountService(discount, req.user!);
        res.status(201).json(result);
    } catch (error) {
        console.error("Error creating discount:", error);
        res.status(500).json({ message: "Failed to create discount" });
        next(error);
    }
};

export const getAllDiscountsController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const discounts = await getAllDiscountsService(req.user!);
        res.status(200).json(discounts);
    } catch (error) {
        console.error("Error fetching discounts:", error);
        res.status(500).json({ message: "Failed to fetch discounts" });
        next(error);
    }
};

export const updateDiscountController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const discountId = parseInt(req.params.discountId);
    const discountData = req.body;
    try {
        const updatedDiscount = await updateDiscountService(discountId, discountData);
        res.status(200).json(updatedDiscount);
    } catch (error) {
        console.error("Error updating discount:", error);
        res.status(500).json({ message: "Failed to update discount" });
        next(error);
    }
};

export const deleteDiscountController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const discountId = parseInt(req.params.discountId);
    try {
        await deleteDiscountService(discountId);
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting discount:", error);
        res.status(500).json({ message: "Failed to delete discount" });
        next(error);
    }
};