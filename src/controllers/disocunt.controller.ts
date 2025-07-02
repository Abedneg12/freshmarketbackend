import { Request, Response, NextFunction } from "express";
import { DiscountBOGO, DiscountProduct, DiscountVoucher } from "../type/discount.type";
import { createDiscountBOGOService, createDiscountProductService, createVoucherService, deleteDiscountService, getAllDiscountsService, updateDiscountService } from "../services/discount.service";

export const createDiscountBOGOController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const discount: DiscountBOGO = req.body;
    try {
        const result = await createDiscountBOGOService(discount);
        res.status(201).json(result);
    } catch (error) {
        console.error("Error creating BOGO discount:", error);
        res.status(500).json({ message: "Failed to create BOGO discount" });
        next(error);
    }
};

export const createDiscountProductController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const discount: DiscountProduct = req.body;
    try {
        const result = await createDiscountProductService(discount);
        res.status(201).json(result);
    } catch (error) {
        console.error("Error creating product discount:", error);
        res.status(500).json({ message: "Failed to create product discount" });
        next(error);
    }
};

export const createVoucherController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const voucher: DiscountVoucher = req.body;
    try {
        const result = await createVoucherService(voucher);
        res.status(201).json(result);
    } catch (error) {
        console.error("Error creating voucher:", error);
        res.status(500).json({ message: "Failed to create voucher" });
        next(error);
    }
};

export const getAllDiscountsController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const discounts = await getAllDiscountsService();
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