import { UserRole } from '@prisma/client';
import { IUserPayload } from '../interfaces/IUserPayload';
import prisma from '../lib/prisma';

export async function getAccessibleStoreIds(adminUser: IUserPayload, requestedStoreId?: number): Promise<number[] | undefined> {
  if (adminUser.role === UserRole.SUPER_ADMIN) {
    // Super Admins can access all stores (undefined) or a specific one if requested.
    return requestedStoreId ? [requestedStoreId] : undefined;
  } else if (adminUser.role === UserRole.STORE_ADMIN) {
    const assignments = await prisma.storeAdminAssignment.findMany({
      where: { userId: adminUser.id },
      select: { storeId: true },
    });
    const assignedStoreIds = assignments.map(a => a.storeId);

    if (requestedStoreId && !assignedStoreIds.includes(requestedStoreId)) {
      throw new Error('Forbidden: Anda tidak memiliki akses ke toko ini.');
    }
    return assignedStoreIds.length > 0 ? assignedStoreIds : [0]; // Return [0] to ensure no data if no assignments
  }
  return [0]; // Default to no access for other roles
}