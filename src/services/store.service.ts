import prisma from "../lib/prisma";

export const getAllStores = async () => {
  try {
    return await prisma.store.findMany({
      include: {
        admins: {
          include: {
            user: {
              select: { id: true, fullName: true, email: true }
            }
          }
        },
        products: true,
        orders: true,
        discounts: true,
        journals: true,
        carts: true,
      },
    });
  } catch (err) {
    console.error("Error fetching stores:", err);
    throw new Error("Failed to fetch stores");
  }
};

export const getStoreById = async (storeId: number) => {
  try {
    return await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        admins: {
          include: {
            user: {
              select: { id: true, fullName: true, email: true }
            }
          }
        },
        products: true,
        orders: true,
        discounts: true,
        journals: true,
        carts: true,
      },
    });
  } catch (err) {
    console.error("Error fetching store:", err);
    throw new Error("Failed to fetch store");
  }
};

export const createStore = async (data: {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}) => {
  try {
    return await prisma.store.create({
      data,
    });
  } catch (err) {
    console.error("Error creating store:", err);
    throw new Error("Failed to create store");
  }
};

export const updateStore = async (
  storeId: number,
  data: Partial<{
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  }>
) => {
  try {
    return await prisma.store.update({
      where: { id: storeId },
      data,
    });
  } catch (err) {
    console.error("Error updating store:", err);
    throw new Error("Failed to update store");
  }
};

export const deleteStore = async (storeId: number) => {
  try {
    return await prisma.store.delete({
      where: { id: storeId },
    });
  } catch (err) {
    console.error("Error deleting store:", err);
    throw new Error("Failed to delete store");
  }
};