
export type DiscountProduct = {
    productId: number;
    storeId: number;
    value: number;
    startDate: string; // ISO date string
    endDate: string; // ISO date string
};

export type DiscountVoucher = {
    storeId: number;
    value: number;
    minPurchase: number;
    maxDiscount?: number; // Optional, can be undefined
    startDate: string; // ISO date string
    endDate: string; // ISO date string
};

export type DiscountBOGO = {
    productId: number;
    storeId: number;
    value: number;
    startDate: string; // ISO date string
    endDate: string; // ISO date string
};