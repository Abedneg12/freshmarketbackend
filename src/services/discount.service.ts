import prisma from "../lib/prisma";
import { Discount, DiscountType} from "../interfaces/discount.type";

export const createDiscountService = async (discount: Discount & { type: DiscountType }) => {
    const { type, productId, storeId, value, minPurchase, maxDiscount, startDate, endDate } = discount;

    // Validation logic
    if (type === "BUY1GET1") {
        if (!productId) throw new Error("BOGO discount requires productId.");
    } else if (type === "NOMINAL" || type === "PERCENTAGE") {
        if (!productId && !minPurchase) {
            throw new Error("minPurchase is required for cart-wide discount.");
        }
        if (type === "PERCENTAGE" && maxDiscount !== undefined && isNaN(Number(maxDiscount))) {
            throw new Error("maxDiscount must be a number for percentage discount.");
        }
        if (value === undefined || isNaN(Number(value))) {
            throw new Error("value must be a number for nominal/percentage discount.");
        }
    } else {
        throw new Error("Invalid discount type.");
    }

    // Check for existing discount
    const existingDiscount = await prisma.discount.findFirst({
        where: { productId, storeId, type }
    });
    if (existingDiscount) {
        throw new Error(`A ${type} discount already exists for this product/store.`);
    }

    // Build data object
    const data: any = {
        productId,
        storeId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        type,
    };

    if (type === "NOMINAL" || type === "PERCENTAGE") {
        data.value = Number(value);
        if (minPurchase) data.minPurchase = minPurchase;
        if (type === "PERCENTAGE" && maxDiscount !== undefined) {
            data.maxDiscount = maxDiscount;
        }
    }

    // BOGO does not need value, minPurchase, maxDiscount

    return await prisma.discount.create({ data });
};

export const getAllDiscountsService = async () => {
    return await prisma.discount.findMany({});
};

export const deleteDiscountService = async (discountId: number) => {
    const discount = await prisma.discount.findUnique({
        where: { id: discountId },
    });
    if (!discount) {
        throw new Error("Discount not found");
    }
    return await prisma.discount.delete({
        where: { id: discountId },
    });
};

export const updateDiscountService = async (discountId: number, data: Partial<Discount>) => {
    const discount = await prisma.discount.findUnique({
        where: { id: discountId },
    });
    if (!discount) {
        throw new Error("Discount not found");
    }
    return await prisma.discount.update({
        where: { id: discountId },
        data: {
            ...data,
            startDate: data.startDate ? new Date(data.startDate) : discount.startDate,
            endDate: data.endDate ? new Date(data.endDate) : discount.endDate,
        },
    });
};