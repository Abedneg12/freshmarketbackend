export type Discount = {
    productId?: number;
    storeId: number;
    value: number;
    minPurchase?: number;
    maxDiscount?: number; // Optional, can be undefined
    startDate: string; // ISO date string
    endDate: string; // ISO date string
};

export type DiscountType = "BUY1GET1" | "NOMINAL" | "PERCENTAGE";