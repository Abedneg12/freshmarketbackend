"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInventoryJournalController = exports.updateProductStockController = void 0;
const inventory_service_1 = require("../services/inventory.service");
const updateProductStockController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId, storeId, quantity, type } = req.body;
        // Validate input in the controller
        if (!productId || !storeId || !quantity || !type) {
            res.status(400).json({
                message: "Invalid input: productId, storeId, quantity, and type are required.",
            });
            return;
        }
        const inventoryData = {
            productId: Number(productId),
            storeId: Number(storeId),
            quantity: Number(quantity),
            type: type, // Assuming type is a string "add" or "remove"
        };
        const updatedStock = yield (0, inventory_service_1.updateProductStock)(inventoryData);
        res.status(200).json(updatedStock);
    }
    catch (error) {
        console.error("Error updating product stock:", error);
        if (error.message.includes("not found") || error.message.includes("Invalid input")) {
            res.status(400).json({ message: error.message });
        }
        else if (error.message.includes("Insufficient stock")) {
            res.status(409).json({ message: error.message }); // 409 Conflict for stock issues
        }
        else {
            res
                .status(500)
                .json({ message: "Failed to update product stock", error: error.message });
        }
        next(error);
    }
});
exports.updateProductStockController = updateProductStockController;
const getInventoryJournalController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const inventoryData = yield (0, inventory_service_1.getInventoryJournal)();
        res.status(200).json(inventoryData);
    }
    catch (error) {
        console.error("Error getting inventory journal :", error);
        if (error.message.includes("not found") || error.message.includes("Invalid input")) {
            res.status(400).json({ message: error.message });
        }
        else {
            res
                .status(500)
                .json({ message: "Failed to get inventory journal", error: error.message });
        }
        next(error);
    }
});
exports.getInventoryJournalController = getInventoryJournalController;
