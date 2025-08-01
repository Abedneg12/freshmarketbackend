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
exports.getDiscountByStoreIdController = exports.deleteDiscountController = exports.updateDiscountController = exports.getAllDiscountsController = exports.createDiscountController = void 0;
const discount_service_1 = require("../services/discount.service");
const createDiscountController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const discount = req.body;
    try {
        const result = yield (0, discount_service_1.createDiscountService)(discount, req.user);
        res.status(201).json(result);
    }
    catch (error) {
        console.error("Error creating discount:", error);
        res.status(500).json({ message: "Failed to create discount" });
        next(error);
    }
});
exports.createDiscountController = createDiscountController;
const getAllDiscountsController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const discounts = yield (0, discount_service_1.getAllDiscountsService)(req.user);
        res.status(200).json(discounts);
    }
    catch (error) {
        console.error("Error fetching discounts:", error);
        res.status(500).json({ message: "Failed to fetch discounts" });
        next(error);
    }
});
exports.getAllDiscountsController = getAllDiscountsController;
const updateDiscountController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const discountId = parseInt(req.params.discountId);
    const discountData = req.body;
    try {
        const updatedDiscount = yield (0, discount_service_1.updateDiscountService)(discountId, discountData);
        res.status(200).json(updatedDiscount);
    }
    catch (error) {
        console.error("Error updating discount:", error);
        res.status(500).json({ message: "Failed to update discount" });
        next(error);
    }
});
exports.updateDiscountController = updateDiscountController;
const deleteDiscountController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const discountId = parseInt(req.params.discountId);
    try {
        yield (0, discount_service_1.deleteDiscountService)(discountId);
        res.status(204).send();
    }
    catch (error) {
        console.error("Error deleting discount:", error);
        res.status(500).json({ message: "Failed to delete discount" });
        next(error);
    }
});
exports.deleteDiscountController = deleteDiscountController;
const getDiscountByStoreIdController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const discounts = yield (0, discount_service_1.getDiscountByStoreId)(req.user);
        res.status(200).json(discounts);
    }
    catch (error) {
        console.error("Error fetching discounts by store ID:", error);
        res.status(500).json({ message: "Failed to fetch discounts" });
        next(error);
    }
});
exports.getDiscountByStoreIdController = getDiscountByStoreIdController;
