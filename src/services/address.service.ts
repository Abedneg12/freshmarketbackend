import prisma from "../lib/prisma";
import { geocodeAddress } from "../utils/geocode";
import { IAddress } from "../interfaces/address";

export const getAllAddresses = async (userId: number) => {
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: { isMain: "desc" },
  });
  return addresses;
};

export const createAddress = async (userId: number, addressData: IAddress) => {
  const fullAddress = `${addressData.addressLine}, ${addressData.city}, ${addressData.province}, ${addressData.postalCode}`;

  let lat = 0;
  let lng = 0;

  try {
    // Bungkus pemanggilan geocode dalam try...catch
    const coordinates = await geocodeAddress(fullAddress);
    lat = coordinates.lat;
    lng = coordinates.lng;
  } catch (error) {
    // Jika geocode gagal (misal: alamat tidak ditemukan, API key salah),
    // lempar error yang jelas.
    console.error("Geocoding failed:", error);
    throw new Error("Gagal memvalidasi lokasi dari alamat yang diberikan.");
  }

  if (addressData.isMain) {
    await prisma.address.updateMany({
      where: { userId, isMain: true },
      data: { isMain: false },
    });
  }

  const newAddress = await prisma.address.create({
    data: {
      userId: userId,
      label: addressData.label,
      recipient: addressData.recipient,
      phone: addressData.phone,
      addressLine: addressData.addressLine,
      city: addressData.city,
      province: addressData.province,
      postalCode: addressData.postalCode,
      isMain: addressData.isMain || false,
      latitude: lat,
      longitude: lng,
    },
  });

  return newAddress;
};

export const updateAddress = async (
  userId: number,
  addressId: number,
  addressData: Partial<IAddress>
) => {
  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId: userId,
    },
  });

  if (!address) {
    throw new Error("Alamat tidak ditemukan atau Anda tidak punya akses.");
  }

  if (addressData.isMain) {
    await prisma.address.updateMany({
      where: { userId: userId },
      data: { isMain: false },
    });
  }

  const updatedAddress = await prisma.address.update({
    where: { id: addressId },
    data: addressData,
  });

  return updatedAddress;
};

export const deleteAddress = async (userId: number, addressId: number) => {
  const result = await prisma.address.deleteMany({
    where: {
      id: addressId,
      userId: userId,
    },
  });

  if (result.count === 0) {
    throw new Error("Alamat tidak ditemukan atau Anda tidak punya akses.");
  }

  return { message: "Alamat berhasil dihapus." };
};
