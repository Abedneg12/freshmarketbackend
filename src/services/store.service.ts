import prisma from "../lib/prisma";

interface StorePayload {
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
}

export const getAllStores = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const stores = await prisma.store.findMany({
    skip: skip,
    take: limit,
    include: {
      admins: {
        select: {
          user: {
            select: { id: true, fullName: true },
          },
        },
      },
    },
    orderBy: { id: "asc" },
  });

  const totalStores = await prisma.store.count();

  return { stores, totalStores };
};

export const createStore = async (data: StorePayload) => {
  return prisma.store.create({
    data: {
      name: data.name,
      address: data.address,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
    },
  });
};

export const updateStore = async (
  storeId: number,
  data: Partial<StorePayload>
) => {
  return prisma.store.update({
    where: { id: storeId },
    data: {
      name: data.name,
      address: data.address,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
    },
  });
};

export const deleteStore = async (storeId: number) => {
  await prisma.storeAdminAssignment.deleteMany({
    where: { storeId: storeId },
  });

  return prisma.store.delete({
    where: { id: storeId },
  });
};
