import { OrderStatus, Prisma, UserRole } from '@prisma/client';
import { IUserPayload } from '../interfaces/IUserPayload';
import prisma from '../lib/prisma';
import { IAdminOrderFilter, TPaymentDecision } from '../interfaces/admin.interface';

// ... (existing getOrdersForAdmin, confirmPayment, shipOrder services) ...

// Helper function to get store IDs for an admin
async function getAccessibleStoreIds(adminUser: IUserPayload, requestedStoreId?: number): Promise<number[] | undefined> {
  if (adminUser.role === UserRole.SUPER_ADMIN) {
    // Super admin can see all stores or a specific requested store
    return requestedStoreId ? [requestedStoreId] : undefined; // undefined means all stores
  } else if (adminUser.role === UserRole.STORE_ADMIN) {
    const assignments = await prisma.storeAdminAssignment.findMany({
      where: { userId: adminUser.id },
      select: { storeId: true },
    });
    const assignedStoreIds = assignments.map(a => a.storeId);

    if (requestedStoreId && !assignedStoreIds.includes(requestedStoreId)) {
      // Store admin requested a store they don't have access to
      throw new Error('Forbidden: Anda tidak memiliki akses ke toko ini.');
    }
    return assignedStoreIds.length > 0 ? assignedStoreIds : [0]; // Return [0] to ensure no data if no assignments
  }
  return [0]; // Default to no access
}

// Laporan Penjualan per Bulan
export const getMonthlySalesReport = async (
  adminUser: IUserPayload,
  year: number,
  storeId?: number
) => {
  const accessibleStoreIds = await getAccessibleStoreIds(adminUser, storeId);

  const whereClause: Prisma.OrderWhereInput = {
    createdAt: {
      gte: new Date(year, 0, 1), // Start of the year
      lt: new Date(year + 1, 0, 1), // Start of next year
    },
    status: {
      in: [OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.PROCESSED], // Consider only successful orders
    },
  };

  if (accessibleStoreIds) {
    whereClause.storeId = { in: accessibleStoreIds };
  }

  const salesData = await prisma.order.groupBy({
    by: ['storeId'],
    where: whereClause,
    _sum: {
      totalPrice: true,
    },
    orderBy: {
      storeId: 'asc',
    },
  });

  // To get sales per month, we need to query OrderItem and group by month
  // Prisma's groupBy currently doesn't support grouping by date parts directly in this way for aggregation.
  // We'll fetch all relevant orders and process in-memory for monthly grouping.
  // For large datasets, consider a database view or a more advanced aggregation tool.

  const allOrders = await prisma.order.findMany({
    where: whereClause,
    select: {
      createdAt: true,
      totalPrice: true,
      storeId: true,
      store: { select: { name: true } } // Include store name
    }
  });

  const monthlySalesMap = new Map<string, { totalSales: number, stores: { [key: number]: { name: string, totalSales: number } } }>();

  allOrders.forEach(order => {
    const monthYear = `${order.createdAt.getFullYear()}-${(order.createdAt.getMonth() + 1).toString().padStart(2, '0')}`;
    if (!monthlySalesMap.has(monthYear)) {
      monthlySalesMap.set(monthYear, { totalSales: 0, stores: {} });
    }
    const monthData = monthlySalesMap.get(monthYear)!;
    monthData.totalSales += order.totalPrice;
    if (!monthData.stores[order.storeId]) {
      monthData.stores[order.storeId] = { name: order.store.name, totalSales: 0 };
    }
    monthData.stores[order.storeId].totalSales += order.totalPrice;
  });

  const monthlySales = Array.from(monthlySalesMap.entries())
    .map(([monthYear, data]) => ({
      monthYear,
      totalSales: data.totalSales,
      stores: Object.values(data.stores),
    }))
    .sort((a, b) => a.monthYear.localeCompare(b.monthYear)); // Sort by month-year

  return monthlySales;
};

// Laporan Penjualan per Bulan berdasarkan Kategori Produk
export const getMonthlySalesByCategoryReport = async (
  adminUser: IUserPayload,
  year: number,
  storeId?: number
) => {
  const accessibleStoreIds = await getAccessibleStoreIds(adminUser, storeId);

  const whereClause: Prisma.OrderWhereInput = {
    createdAt: {
      gte: new Date(year, 0, 1),
      lt: new Date(year + 1, 0, 1),
    },
    status: {
      in: [OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.PROCESSED],
    },
  };

  if (accessibleStoreIds) {
    whereClause.storeId = { in: accessibleStoreIds };
  }

  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: whereClause, // Filter order items based on order criteria
    },
    include: {
      product: {
        include: {
          category: true,
        },
      },
      order: {
        select: {
          createdAt: true,
          storeId: true,
          store: { select: { name: true } }
        }
      }
    },
  });

  const monthlyCategorySalesMap = new Map<string, { [categoryName: string]: { totalSales: number, quantitySold: number } }>();

  orderItems.forEach(item => {
    const monthYear = `${item.order.createdAt.getFullYear()}-${(item.order.createdAt.getMonth() + 1).toString().padStart(2, '0')}`;
    const categoryName = item.product.category.name;
    const itemSales = item.quantity * item.price;

    if (!monthlyCategorySalesMap.has(monthYear)) {
      monthlyCategorySalesMap.set(monthYear, {});
    }
    const monthData = monthlyCategorySalesMap.get(monthYear)!;

    if (!monthData[categoryName]) {
      monthData[categoryName] = { totalSales: 0, quantitySold: 0 };
    }
    monthData[categoryName].totalSales += itemSales;
    monthData[categoryName].quantitySold += item.quantity;
  });

  const monthlyCategorySales = Array.from(monthlyCategorySalesMap.entries())
    .map(([monthYear, categoriesData]) => ({
      monthYear,
      categories: Object.entries(categoriesData).map(([name, data]) => ({
        name,
        totalSales: data.totalSales,
        quantitySold: data.quantitySold,
      })).sort((a, b) => b.totalSales - a.totalSales), // Sort categories by sales
    }))
    .sort((a, b) => a.monthYear.localeCompare(b.monthYear));

  return monthlyCategorySales;
};

// Laporan Penjualan per Bulan berdasarkan Produk
export const getMonthlySalesByProductReport = async (
  adminUser: IUserPayload,
  year: number,
  storeId?: number
) => {
  const accessibleStoreIds = await getAccessibleStoreIds(adminUser, storeId);

  const whereClause: Prisma.OrderWhereInput = {
    createdAt: {
      gte: new Date(year, 0, 1),
      lt: new Date(year + 1, 0, 1),
    },
    status: {
      in: [OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.PROCESSED],
    },
  };

  if (accessibleStoreIds) {
    whereClause.storeId = { in: accessibleStoreIds };
  }

  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: whereClause,
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
        },
      },
      order: {
        select: {
          createdAt: true,
          storeId: true,
          store: { select: { name: true } }
        }
      }
    },
  });

  const monthlyProductSalesMap = new Map<string, { [productName: string]: { totalSales: number, quantitySold: number } }>();

  orderItems.forEach(item => {
    const monthYear = `${item.order.createdAt.getFullYear()}-${(item.order.createdAt.getMonth() + 1).toString().padStart(2, '0')}`;
    const productName = item.product.name;
    const itemSales = item.quantity * item.price;

    if (!monthlyProductSalesMap.has(monthYear)) {
      monthlyProductSalesMap.set(monthYear, {});
    }
    const monthData = monthlyProductSalesMap.get(monthYear)!;

    if (!monthData[productName]) {
      monthData[productName] = { totalSales: 0, quantitySold: 0 };
    }
    monthData[productName].totalSales += itemSales;
    monthData[productName].quantitySold += item.quantity;
  });

  const monthlyProductSales = Array.from(monthlyProductSalesMap.entries())
    .map(([monthYear, productsData]) => ({
      monthYear,
      products: Object.entries(productsData).map(([name, data]) => ({
        name,
        totalSales: data.totalSales,
        quantitySold: data.quantitySold,
      })).sort((a, b) => b.totalSales - a.totalSales), // Sort products by sales
    }))
    .sort((a, b) => a.monthYear.localeCompare(b.monthYear));

  return monthlyProductSales;
};