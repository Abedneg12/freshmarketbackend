import prisma from "../lib/prisma";
import { DiscountVoucher, DiscountBOGO, DiscountProduct } from "../interfaces/discount.type";
import { DiscountType } from "@prisma/client";

export const createDiscountBOGOService = async (discount: DiscountBOGO) => {
    const { productId, storeId, value, startDate, endDate } = discount;
    const existingDiscount = await prisma.discount.findFirst({
        where: {
            productId,
            storeId,
            type: DiscountType.BUY1GET1,
        },
    });
    if (existingDiscount) {
        throw new Error("A BOGO discount already exists for this product.");
    }
    return await prisma.discount.create({
        data: {
            productId,
            storeId,
            value,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            type: DiscountType.BUY1GET1,
        },
    });
}
export const createDiscountProductService = async (discount: DiscountProduct) => {
    const { productId, storeId, value, startDate, endDate } = discount;
    const existingDiscount = await prisma.discount.findFirst({
        where: {
            productId,
            storeId,
            type: DiscountType.PERCENTAGE,
        },
    });
    if (existingDiscount) {
        throw new Error("A percentage discount already exists for this product.");
    }
    return await prisma.discount.create({
        data: {
            productId,
            storeId,
            value,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            type: DiscountType.NOMINAL,
        },
    });
}
export const createVoucherService = async (voucher: DiscountVoucher) => {
    const { storeId, value, minPurchase, maxDiscount, startDate, endDate } = voucher;

    return await prisma.discount.create({
        data: {
            storeId,
            value,
            minPurchase,
            maxDiscount,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            type: DiscountType.PERCENTAGE,
        },
    });
}

export const getAllDiscountsService = async () => {
    return await prisma.discount.findMany({
        select: {
            id: true,
            type: true,
            value: true,
            startDate: true,
            endDate: true,
        },
    });
}


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
}

export const updateDiscountService = async (discountId: number, data: Partial<DiscountProduct | DiscountVoucher | DiscountBOGO>) => {
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
            value: data.value ?? discount.value,
            minPurchase: 'minPurchase' in data ? (data as any).minPurchase ?? discount.minPurchase : discount.minPurchase,
            maxDiscount: 'maxDiscount' in data ? (data as any).maxDiscount ?? discount.maxDiscount : discount.maxDiscount,
            startDate: data.startDate ? new Date(data.startDate) : discount.startDate,
            endDate: data.endDate ? new Date(data.endDate) : discount.endDate,
        },
    });
}

export function calculateDiscount(discountStr: string, price: number): number {
    if (discountStr.endsWith('%')) {
        const percent = parseFloat(discountStr.slice(0, -1));
        return Math.floor(price * (percent / 100));
    } else {
        return parseInt(discountStr, 10);
    }
}