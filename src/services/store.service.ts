import prisma from "../lib/prisma";
import { cloudinaryUpload, cloudinaryRemove } from "../utils/cloudinary";

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

export const createStore = async (
  data: StorePayload,
  file?: Express.Multer.File
) => {
  let imageUrl = "";
  if (file) {
    const uploadResult = await cloudinaryUpload(file);
    imageUrl = uploadResult.secure_url;
  }

  return prisma.store.create({
    data: {
      name: data.name,
      address: data.address,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
      imageUrl: imageUrl,
    },
  });
};

export const updateStore = async (
  storeId: number,
  data: Partial<StorePayload> & { removeImage?: string },
  file?: Express.Multer.File
) => {
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) throw new Error("Toko tidak ditemukan");

  let updatedImageUrl = store.imageUrl;

  if (data.removeImage === "true" && store.imageUrl) {
    await cloudinaryRemove(store.imageUrl);
    updatedImageUrl = "";
  }

  if (file) {
    if (store.imageUrl) {
      await cloudinaryRemove(store.imageUrl);
    }
    const uploadResult = await cloudinaryUpload(file);
    updatedImageUrl = uploadResult.secure_url;
  }

  return prisma.store.update({
    where: { id: storeId },
    data: {
      name: data.name,
      address: data.address,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
      imageUrl: updatedImageUrl,
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
