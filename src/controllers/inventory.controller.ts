import { Request, Response, NextFunction } from "express";
import { updateProductStock } from "../services/inventory.service";

export const updateProductStockController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId, storeId, quantity, type } = req.body;

    // Validate input in the controller
    if (!productId || !storeId || !quantity || !type) {
      res.status(400).json({
        message:
          "Invalid input: productId, storeId, quantity, and type are required.",
      });
      return;
    }

    const inventoryData = {
      productId: Number(productId),
      storeId: Number(storeId),
      quantity: Number(quantity),
      type: type as "IN" | "OUT", // Assuming type is a string "add" or "remove"
    };

    const updatedStock = await updateProductStock(inventoryData);
    res.status(200).json(updatedStock);
  } catch (error: any) {
    console.error("Error updating product stock:", error);

    if (error.message.includes("not found") || error.message.includes("Invalid input")) {
      res.status(400).json({ message: error.message });
    } else if (error.message.includes("Insufficient stock")) {
      res.status(409).json({ message: error.message }); // 409 Conflict for stock issues
    } else {
      res
        .status(500)
        .json({ message: "Failed to update product stock", error: error.message });
    }
    next(error);
  }
};