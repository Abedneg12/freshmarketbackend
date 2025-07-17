import prisma from "../lib/prisma";
import { geocodeAddress } from "../utils/geocode";

export const getAllStores = async () => {
  return prisma.store.findMany({
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
};

export const createStore = async (data: { name: string; address: string }) => {
  const { lat, lng } = await geocodeAddress(data.address);
  return prisma.store.create({
    data: {
      name: data.name,
      address: data.address,
      latitude: lat,
      longitude: lng,
    },
  });
};

export const updateStore = async (
  storeId: number,
  data: { name: string; address: string }
) => {
  const { lat, lng } = await geocodeAddress(data.address);

  return prisma.store.update({
    where: { id: storeId },
    data: {
      name: data.name,
      address: data.address,
      latitude: lat,
      longitude: lng,
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
