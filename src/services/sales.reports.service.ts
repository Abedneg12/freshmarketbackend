import { OrderStatus, Prisma } from '@prisma/client';
import { IUserPayload } from '../interfaces/IUserPayload';
import prisma from '../lib/prisma';
import { getAccessibleStoreIds } from '../utils/access.util';

export const getMonthlySalesReport = async (
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
      order: whereClause, 
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
      })).sort((a, b) => b.totalSales - a.totalSales), 
    }))
    .sort((a, b) => a.monthYear.localeCompare(b.monthYear));

  return monthlyCategorySales;
};

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
      })).sort((a, b) => b.totalSales - a.totalSales),
    }))
    .sort((a, b) => a.monthYear.localeCompare(b.monthYear));

  return monthlyProductSales;
};
