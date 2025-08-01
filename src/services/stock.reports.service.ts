import { IUserPayload } from '../interfaces/IUserPayload';
import prisma from '../lib/prisma';
import { getAccessibleStoreIds } from '../utils/access.util';

export const getMonthlyStockSummaryReport = async (
  adminUser: IUserPayload,
  year: number,
  month: number, // 1-12
  storeId?: number
) => {
  const accessibleStoreIds = await getAccessibleStoreIds(adminUser, storeId);
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  // Fetch all inventory journals up to the end of the requested month
  const allMovements = await prisma.inventoryJournal.findMany({
    where: {
      createdAt: {
        lte: endDate,
      },
      storeId: {
        in: accessibleStoreIds,
      },
    },
    select: {
      productId: true,
      quantity: true,
      type: true,
      createdAt: true,
      product: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  const reportMap = new Map<
    number,
    {
      productName: string;
      beginningStock: number;
      totalAdditions: number;
      totalSubtractions: number;
      endingStock: number;
    }
  >();

  for (const movement of allMovements) {
    if (!reportMap.has(movement.productId)) {
      reportMap.set(movement.productId, {
        productName: movement.product.name,
        beginningStock: 0,
        totalAdditions: 0,
        totalSubtractions: 0,
        endingStock: 0,
      });
    }

    const entry = reportMap.get(movement.productId)!;
    const change = movement.type === 'IN' ? movement.quantity : -movement.quantity;

    // If movement is before the start of the month, it contributes to beginning stock
    if (movement.createdAt < startDate) {
      entry.beginningStock += change;
    } else {
      // Movement is within the month
      if (change > 0) {
        entry.totalAdditions += change;
      } else {
        entry.totalSubtractions += Math.abs(change);
      }
    }
  }

  // Calculate final ending stock after processing all movements
  for (const entry of reportMap.values()) {
    entry.endingStock =
      entry.beginningStock + entry.totalAdditions - entry.totalSubtractions;
  }

  return Array.from(reportMap.values())
    .filter(
      (r) =>
        r.endingStock !== 0 || r.totalAdditions !== 0 || r.totalSubtractions !== 0
    )
    .sort((a, b) => a.productName.localeCompare(b.productName));
};

export const getMonthlyStockDetailReport = async (
  adminUser: IUserPayload,
  year: number,
  month: number,
  productId: number,
  storeId?: number
) => {
  const accessibleStoreIds = await getAccessibleStoreIds(adminUser, storeId);
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  // 1. Get all changes before the start of the month to calculate starting stock
  const priorMovements = await prisma.inventoryJournal.findMany({
    where: {
      productId: productId,
      createdAt: { lt: startDate },
      storeId: { in: accessibleStoreIds },
    },
    select: { quantity: true, type: true },
  });

  const startingStock = priorMovements.reduce((sum, movement) => {
    return sum + (movement.type === 'IN' ? movement.quantity : -movement.quantity);
  }, 0);

  // 2. Get all movements within the month
  const movements = await prisma.inventoryJournal.findMany({
    where: {
      productId: productId,
      createdAt: { gte: startDate, lte: endDate },
      storeId: { in: accessibleStoreIds },
    },
    include: {
      store: { select: { name: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return { startingStock, movements };
};