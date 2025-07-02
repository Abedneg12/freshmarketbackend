import { OrderStatus } from "@prisma/client";

export interface IAdminOrderFilter {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: OrderStatus;
  storeId?: number;
  orderId?: number;
}

export type TPaymentDecision = 'APPROVE' | 'REJECT';