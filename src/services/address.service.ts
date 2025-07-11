import prisma from "../lib/prisma";
import { geocodeAddress } from "../utils/geocode";

interface AddressData {
  label: string;
  recipient: string;
  phone: string;
  addressLine: string;
  city: string;
  province: string;
  postalCode: string;
  isMain?: boolean;
}

export const getAllAddresses = async (userId: number) => {
  return await prisma.address.findMany({
    where: { userId },
    orderBy: { isMain: "desc" },
  });
};

export const createAddress = async (userId: number, data: AddressData) => {
  const fullAddress = `${data.addressLine}, ${data.city}, ${data.province}`;
  const { lat, lng } = await geocodeAddress(fullAddress);

  if (data.isMain) {
    return prisma.$transaction(async (tx) => {
      await tx.address.updateMany({
        where: { userId, isMain: true },
        data: { isMain: false },
      });
      const newAddress = await tx.address.create({
        data: { ...data, userId, latitude: lat, longitude: lng, isMain: true },
      });
      return newAddress;
    });
  }

  return await prisma.address.create({
    data: { ...data, userId, latitude: lat, longitude: lng },
  });
};

export const setMainAddress = async (userId: number, addressId: number) => {
  return prisma.$transaction(async (tx) => {
    await tx.address.updateMany({
      where: { userId, isMain: true },
      data: { isMain: false },
    });
    const updatedAddress = await tx.address.update({
      where: { id: addressId, userId },
      data: { isMain: true },
    });
    return updatedAddress;
  });
};

export const updateAddress = async (
  userId: number,
  addressId: number,
  data: Partial<AddressData>
) => {
  if (data.addressLine || data.city || data.province) {
    const currentAddress = await prisma.address.findUnique({
      where: { id: addressId },
    });
    const fullAddress = `${data.addressLine || currentAddress?.addressLine}, ${
      data.city || currentAddress?.city
    }, ${data.province || currentAddress?.province}`;
    const { lat, lng } = await geocodeAddress(fullAddress);
    return await prisma.address.update({
      where: { id: addressId, userId },
      data: { ...data, latitude: lat, longitude: lng },
    });
  }

  return await prisma.address.update({
    where: { id: addressId, userId },
    data,
  });
};

export const deleteAddress = async (userId: number, addressId: number) => {
  return await prisma.address.delete({
    where: { id: addressId, userId },
  });
};
