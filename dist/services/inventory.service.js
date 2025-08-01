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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInventoryJournal = exports.updateProductStock = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const updateProductStock = (inventoryData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId, storeId, quantity, type } = inventoryData;
        // Validate input data (add more validations as needed)
        if (!productId || !storeId || !quantity || !type) {
            throw new Error("Invalid input data: productId, storeId, quantity, and type are required.");
        }
        if (quantity <= 0) {
            throw new Error("Quantity must be greater than zero.");
        }
        if (type !== "OUT" && type !== "IN") {
            throw new Error('Type must be either "IN" or "OUT".');
        }
        // Check if the product and store exist
        const product = yield prisma_1.default.product.findUnique({ where: { id: productId } });
        const store = yield prisma_1.default.store.findUnique({ where: { id: storeId } });
        if (!product) {
            throw new Error(`Product with ID ${productId} not found.`);
        }
        if (!store) {
            throw new Error(`Store with ID ${storeId} not found.`);
        }
        return yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            // Create an inventory journal entry
            const journalEntry = yield prisma.inventoryJournal.create({
                data: {
                    productId,
                    storeId,
                    quantity,
                    type,
                },
            });
            // Update stock information
            const stock = yield prisma.stock.findFirst({
                where: { productId, storeId },
            });
            if (type === "IN") {
                if (stock) {
                    yield prisma.stock.update({
                        where: { id: stock.id },
                        data: { quantity: stock.quantity + quantity },
                    });
                }
                else {
                    yield prisma.stock.create({
                        data: { productId, storeId, quantity },
                    });
                }
            }
            else if (type === "OUT") {
                if (!stock || stock.quantity < quantity) {
                    throw new Error("Insufficient stock to remove.");
                }
                yield prisma.stock.update({
                    where: { id: stock.id },
                    data: { quantity: stock.quantity - quantity },
                });
            }
            return journalEntry;
        }));
    }
    catch (error) {
        console.error("Error adding product to store:", error.message);
        throw new Error(`Could not add product to store: ${error.message}`);
    }
});
exports.updateProductStock = updateProductStock;
const getInventoryJournal = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const inventoryJournal = yield prisma_1.default.inventoryJournal.findMany({
            include: {
                product: { include: { images: true } },
                store: true,
            }
        });
        return inventoryJournal;
    }
    catch (error) {
        console.error("Error fetching inventory journal:", error.message);
        throw new Error(`Error fetching inventory journal: ${error.message}`);
    }
});
exports.getInventoryJournal = getInventoryJournal;
