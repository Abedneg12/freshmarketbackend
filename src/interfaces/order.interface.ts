export interface GetUserOrdersFilter {
    status?: string;
    orderId?: number;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
    sortBy?: string; // default: createdAt
    sortOrder?: 'asc' | 'desc'; // default: desc
  }