import prisma from "../lib/prisma";

interface InventoryJournalEntry {
    productId: number;
    storeId: number;
    quantity: number;
    type: "OUT" | "IN";
    note?: string;
}

export const updateProductStock = async (
    inventoryData: InventoryJournalEntry
) => {
    try {
        const { productId, storeId, quantity, type } = inventoryData;

        // Validate input data (add more validations as needed)
        if (!productId || !storeId || !quantity || !type) {
            throw new Error(
                "Invalid input data: productId, storeId, quantity, and type are required."
            );
        }

        if (quantity <= 0) {
            throw new Error("Quantity must be greater than zero.");
        }

        if (type !== "OUT" && type !== "IN") {
            throw new Error('Type must be either "IN" or "OUT".');
        }

        // Check if the product and store exist
        const product = await prisma.product.findUnique({ where: { id: productId } });
        const store = await prisma.store.findUnique({ where: { id: storeId } });

        if (!product) {
            throw new Error(`Product with ID ${productId} not found.`);
        }
        if (!store) {
            throw new Error(`Store with ID ${storeId} not found.`);
        }

        return await prisma.$transaction(async (prisma) => {
            // Create an inventory journal entry
            const journalEntry = await prisma.inventoryJournal.create({
                data: {
                    productId,
                    storeId,
                    quantity,
                    type,
                },
            });

            // Update stock information
            const stock = await prisma.stock.findFirst({
                where: { productId, storeId },
            });

            if (type === "IN") {
                if (stock) {
                    await prisma.stock.update({
                        where: { id: stock.id },
                        data: { quantity: stock.quantity + quantity },
                    });
                } else {
                    await prisma.stock.create({
                        data: { productId, storeId, quantity },
                    });
                }
            } else if (type === "OUT") {
                if (!stock || stock.quantity < quantity) {
                    throw new Error("Insufficient stock to remove.");
                }
                await prisma.stock.update({
                    where: { id: stock.id },
                    data: { quantity: stock.quantity - quantity },
                });
            }
            return journalEntry;
        });
    } catch (error: any) {
        console.error("Error adding product to store:", error.message);
        throw new Error(
            `Could not add product to store: ${error.message}`
        );
    }
};