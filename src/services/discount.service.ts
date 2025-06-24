import prisma from "../lib/prisma";
import { DiscountVoucher, DiscountBOGO, DiscountProduct } from "../type/discount.type";
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

export const getAllDiscountsService = async (storeId: number) => {
    return await prisma.discount.findMany({
        where: {
            storeId,
        },
        include: {
            product: true, // Include product details if needed
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